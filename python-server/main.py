from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
import io
import re
import uuid
import fitz  # PyMuPDF
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import json

# Import required libraries
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_classic.retrievers.multi_vector import MultiVectorRetriever  # type: ignore
from langchain_core.stores import InMemoryStore
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import google.generativeai as genai
from dotenv import load_dotenv
import concurrent.futures

load_dotenv('.env.local')


app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Utility functions
def encode_image(image_path):
    """Getting the base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def looks_like_base64(sb):
    """Check if the string looks like base64"""
    return re.match("^[A-Za-z0-9+/]+[=]{0,2}$", sb) is not None

def is_image_data(b64data):
    """Check if the base64 data is an image"""
    image_signatures = {
        b"\xFF\xD8\xFF": "jpg",
        b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A": "png",
        b"\x47\x49\x46\x38": "gif",
        b"\x52\x49\x46\x46": "webp",
    }
    try:
        header = base64.b64decode(b64data)[:8]
        for sig, format in image_signatures.items():
            if header.startswith(sig):
                return True
        return False
    except Exception:
        return False

def resize_base64_image(base64_string, size=(300, 200)):
    """Resize an image encoded as a Base64 string for frontend display"""
    try:
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        resized_img = img.resize(size, Image.LANCZOS)
        buffered = io.BytesIO()
        resized_img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Error resizing image: {e}")
        return base64_string

def extract_images_from_pdf(pdf_path, output_dir):
    """Extract images from PDF using PyMuPDF and return with metadata"""
    os.makedirs(output_dir, exist_ok=True)
    extracted_images = []
    
    try:
        doc = fitz.open(pdf_path)
        pdf_name = os.path.basename(pdf_path)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    
                    # Convert to PIL Image
                    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                    
                    # Save image
                    image_filename = f"{pdf_name}_page_{page_num + 1}_img_{img_index + 1}.png"
                    image_path = os.path.join(output_dir, image_filename)
                    pil_image.save(image_path, "PNG")
                    
                    # Create image metadata
                    image_metadata = {
                        'path': image_path,
                        'filename': image_filename,
                        'pdf_source': pdf_name,
                        'page_number': page_num + 1,
                        'image_index': img_index + 1,
                        'base64': encode_image(image_path),
                        'type': 'image'
                    }
                    
                    extracted_images.append(image_metadata)
                    
                except Exception as e:
                    print(f"Error processing image {img_index} on page {page_num}: {e}")
                    continue
        
        doc.close()
        return extracted_images
    
    except Exception as e:
        print(f"Error extracting images from PDF: {e}")
        return []


def process_pdf_file(pdf_file, pdf_images_dir):
    """Helper to extract text and images from a single PDF file (used for parallel processing)."""
    texts_out = []
    images_out = []
    try:
        loader = PyPDFLoader(pdf_file)
        docs = loader.load()
        texts_out.extend([d.page_content for d in docs])
    except Exception as e:
        print(f"Error extracting text from {pdf_file}: {e}")

    try:
        extracted = extract_images_from_pdf(pdf_file, pdf_images_dir)
        images_out.extend(extracted)
    except Exception as e:
        print(f"Error extracting images from {pdf_file}: {e}")

    return texts_out, images_out

# Text summarization
def generate_text_summaries(texts, tables, summarize_texts=False):
    """Summarize text elements"""
    prompt_text = """You are an assistant tasked with summarizing tables and text for retrieval. \
    These summaries will be embedded and used to retrieve the raw text or table elements. \
    Give a concise summary of the table or text that is well optimized for retrieval. Table or text: {element}"""
    
    prompt = PromptTemplate.from_template(prompt_text)
    
    model = ChatGoogleGenerativeAI(
        temperature=0, 
        model="gemini-2.5-flash", 
        max_output_tokens=1024
    )
    
    summarize_chain = {"element": lambda x: x} | prompt | model | StrOutputParser()

    text_summaries = []
    table_summaries = []

    if texts and summarize_texts:
        # Increase concurrency for text summarization to speed up processing.
        # Use a conservative limit to avoid overwhelming the API or local resources.
        max_conc = min(4, max(1, len(texts)))
        try:
            text_summaries = summarize_chain.batch(texts, {"max_concurrency": max_conc})
        except Exception as e:
            print(f"Text summarization batch failed with concurrency {max_conc}, falling back: {e}")
            text_summaries = summarize_chain.batch(texts, {"max_concurrency": 1})
    elif texts:
        text_summaries = texts

    if tables:
        table_summaries = summarize_chain.batch(tables, {"max_concurrency": 1})

    return text_summaries, table_summaries

# Image summarization
def image_summarize(img_base64, prompt):
    """Make image summary using Gemini Pro Vision"""
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-image", max_output_tokens=1024)
    
    msg = model(
        [
            HumanMessage(
                content=[
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"},
                    },
                ]
            )
        ]
    )
    return msg.content

def generate_img_summaries_from_paths(image_metadata_list):
    """Generate summaries for images from file paths"""
    img_base64_list = []
    image_summaries = []
    
    prompt = """You are an assistant tasked with summarizing images for retrieval. \
    These summaries will be embedded and used to retrieve the raw image. \
    Give a concise summary of the image that is well optimized for retrieval.
    Include any visible text, figure numbers, chart types, or key visual elements."""
    
    print(f"Starting image summarization for {len(image_metadata_list)} images")
    
    for image_meta in image_metadata_list:
        base64_image = image_meta.get('base64')
        if not base64_image:
            print(f"No base64 data for image: {image_meta.get('filename')}")
            continue
        
        try:
            print(f"Summarizing image: {image_meta.get('filename')}")
            summary = image_summarize(base64_image, prompt)
            # Only add both if summary succeeds - keep lists in sync
            img_base64_list.append(base64_image)
            image_summaries.append(summary)
            print(f"Successfully summarized: {image_meta.get('filename')}")
        except Exception as e:
            print(f"Error summarizing image {image_meta.get('filename')}: {e}")
            # Create a fallback summary using metadata
            fallback_summary = f"Image from {image_meta.get('pdf_source', 'unknown')} page {image_meta.get('page_number', 'unknown')}, figure {image_meta.get('image_index', 'unknown')}"
            img_base64_list.append(base64_image)
            image_summaries.append(fallback_summary)
            print(f"Using fallback summary for: {image_meta.get('filename')}")
    
    print(f"Completed image summarization: {len(image_summaries)} summaries generated")
    return img_base64_list, image_summaries

# Multi-vector retriever
def create_multi_vector_retriever(vectorstore, text_summaries, texts, table_summaries, tables, image_summaries, images, image_metadata_list):
    """Create retriever that indexes summaries but returns raw content"""
    store = InMemoryStore()
    id_key = "doc_id"
    
    retriever = MultiVectorRetriever(
        vectorstore=vectorstore,
        docstore=store,
        id_key=id_key,
    )
    
    def add_documents(retriever, doc_summaries, doc_contents, doc_type="text", metadata_list=None):
        doc_ids = [str(uuid.uuid4()) for _ in doc_contents]
        print(f"Adding {len(doc_contents)} documents of type: {doc_type}")
        
        # Create summary documents for vectorstore
        summary_docs = []
        for i, summary in enumerate(doc_summaries):
            metadata = {id_key: doc_ids[i], "type": doc_type}
            if metadata_list and i < len(metadata_list):
                metadata.update(metadata_list[i])
            summary_docs.append(Document(page_content=summary, metadata=metadata))
            print(f"Created summary doc {i} with metadata: {metadata}")
        
        retriever.vectorstore.add_documents(summary_docs)
        print(f"Added {len(summary_docs)} summary documents to vectorstore")
        
        # Store original content in docstore
        store_contents = []
        for i, content in enumerate(doc_contents):
            store_item = {
                "content": content,
                "type": doc_type,
                "metadata": metadata_list[i] if metadata_list and i < len(metadata_list) else {}
            }
            store_contents.append(json.dumps(store_item))  # Convert to string
            print(f"Prepared store item {i} for doc_id {doc_ids[i]}: type={doc_type}")
        
        retriever.docstore.mset(list(zip(doc_ids, store_contents)))
        print(f"Stored {len(store_contents)} items in docstore")
    
    # Add texts
    if text_summaries:
        text_metadata_list = [{"index": i, "content_type": "text"} for i in range(len(texts))]
        add_documents(retriever, text_summaries, texts, "text", text_metadata_list)
    
    # Add tables
    if table_summaries:
        table_metadata_list = [{"index": i, "content_type": "table"} for i in range(len(tables))]
        add_documents(retriever, table_summaries, tables, "table", table_metadata_list)
    
    # Add images
    if image_summaries:
        print(f"Adding {len(image_summaries)} image summaries to retriever")
        # Prepare image metadata for storage
        image_metadata_for_storage = []
        for meta in image_metadata_list:
            storage_meta = {
                "filename": meta['filename'],
                "pdf_source": meta['pdf_source'],
                "page_number": meta['page_number'],
                "image_index": meta['image_index'],
                "content_type": "image"
            }
            image_metadata_for_storage.append(storage_meta)
            print(f"Image metadata for storage: {storage_meta}")
        
        add_documents(retriever, image_summaries, images, "image", image_metadata_for_storage)
        print(f"Successfully added {len(images)} images to retriever")
    
    return retriever

# RAG chain components
def split_image_text_types(docs):
    """Split base64-encoded images and texts"""
    b64_images = []
    texts = []
    
    for doc in docs:
        try:
            # Parse the stored document
            if isinstance(doc, Document):
                doc_content = doc.page_content
            else:
                doc_content = doc
                
            # Try to parse as JSON to get the actual content
            try:
                parsed_doc = json.loads(doc_content)
                actual_content = parsed_doc.get("content", doc_content)
                doc_type = parsed_doc.get("type", "unknown")
            except:
                actual_content = doc_content
                doc_type = "unknown"
            
            if looks_like_base64(actual_content) and is_image_data(actual_content):
                # Resize for display
                resized_image = resize_base64_image(actual_content, size=(300, 200))
                b64_images.append(resized_image)
            else:
                texts.append(actual_content)
        except Exception as e:
            print(f"Error processing document in split_image_text_types: {e}")
            texts.append(str(doc))
    
    return {"images": b64_images, "texts": texts}

def img_prompt_func(data_dict):
    """Create prompt for multi-modal RAG"""
    formatted_texts = "\n".join(data_dict["context"]["texts"])
    messages = []
    
    text_message = {
        "type": "text",
        "text": (
            "You are a helpful assistant tasked with answering questions based on provided content.\n"
            "You will be given a mix of text, tables, and image(s) usually of charts or graphs.\n"
            "Use this information to provide comprehensive answers related to the user question. \n"
            f"User-provided question: {data_dict['question']}\n\n"
            "Text and/or tables:\n"
            f"{formatted_texts}"
        ),
    }
    messages.append(text_message)
    
    if data_dict["context"]["images"]:
        for image in data_dict["context"]["images"]:
            image_message = {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image}"},
            }
            messages.append(image_message)
    
    return [HumanMessage(content=messages)]

def multi_modal_rag_chain(retriever):
    """Multi-modal RAG chain"""
    model = ChatGoogleGenerativeAI(
        temperature=0, 
        model="gemini-2.5-flash-image", 
        max_output_tokens=1024
    )
    
    chain = (
        {
            "context": retriever | RunnableLambda(split_image_text_types),
            "question": RunnablePassthrough(),
        }
        | RunnableLambda(img_prompt_func)
        | model
        | StrOutputParser()
    )
    
    return chain

# Global variables to store the retriever and chain
retriever_multi_vector_img = None
chain_multimodal_rag = None
image_metadata_store = []

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle file uploads and initialize RAG system"""
    global retriever_multi_vector_img, chain_multimodal_rag, image_metadata_store
    
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files or all(file.filename == '' for file in files):
            return jsonify({'error': 'No selected files'}), 400
        
        # Process files
        pdf_files = []
        image_files = []
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                if filename.lower().endswith('.pdf'):
                    pdf_files.append(filepath)
                else:
                    # Create metadata for uploaded images
                    image_meta = {
                        'path': filepath,
                        'filename': filename,
                        'pdf_source': 'uploaded_image',
                        'page_number': 1,
                        'image_index': 1,
                        'base64': encode_image(filepath),
                        'type': 'image'
                    }
                    image_files.append(image_meta)
        
        # Process PDFs - extract text and images
        texts = []
        tables = []
        extracted_images = []
        
        # Process PDFs in parallel to speed up handling of multiple files
        if pdf_files:
            pdf_images_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'extracted_images')
            os.makedirs(pdf_images_dir, exist_ok=True)

            max_workers = min(4, max(1, len(pdf_files)))
            print(f"Processing {len(pdf_files)} PDF(s) with max_workers={max_workers}")
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [executor.submit(process_pdf_file, pdf_file, pdf_images_dir) for pdf_file in pdf_files]
                for fut in concurrent.futures.as_completed(futures):
                    try:
                        texts_out, imgs_out = fut.result()
                        texts.extend(texts_out)
                        extracted_images.extend(imgs_out)
                    except Exception as e:
                        print(f"Error processing PDF in thread: {e}")
        
        # Combine uploaded images with extracted PDF images
        all_image_metadata = image_files + extracted_images
        image_metadata_store = all_image_metadata
        
        # Process images
        img_base64_list = []
        image_summaries_list = []
        
        if all_image_metadata:
            print(f"Processing {len(all_image_metadata)} images for summaries")
            img_base64_list, image_summaries_list = generate_img_summaries_from_paths(all_image_metadata)
            print(f"Generated {len(image_summaries_list)} image summaries")
        
        # Generate text summaries
        text_summaries, table_summaries = generate_text_summaries(
            texts, tables, summarize_texts=True
        )
        
        print(f"Text summaries: {len(text_summaries)}, Table summaries: {len(table_summaries)}, Image summaries: {len(image_summaries_list)}")
        
        # Create vectorstore
        vectorstore = Chroma(
            collection_name="mm_rag_app",
            embedding_function=GoogleGenerativeAIEmbeddings(model="models/text-embedding-004"),
        )
        
        # Create retriever
        retriever_multi_vector_img = create_multi_vector_retriever(
            vectorstore,
            text_summaries,
            texts,
            table_summaries,
            tables,
            image_summaries_list,
            img_base64_list,
            all_image_metadata
        )
        
        print(f"Created retriever with {len(img_base64_list)} images stored")
        
        # Create RAG chain
        chain_multimodal_rag = multi_modal_rag_chain(retriever_multi_vector_img)
        
        # Prepare image info for frontend
        image_info = []
        for meta in all_image_metadata:
            image_info.append({
                'filename': meta['filename'],
                'pdf_source': meta['pdf_source'],
                'page_number': meta['page_number'],
                'image_index': meta['image_index'],
                'preview_url': f"/api/images/{os.path.basename(meta['path'])}"
            })
        
        return jsonify({
            'message': f'Successfully processed {len(pdf_files)} PDFs and {len(image_files)} images',
            'text_chunks': len(texts),
            'images_uploaded': len(image_files),
            'images_extracted_from_pdf': len(extracted_images),
            'total_images': len(all_image_metadata),
            'images': image_info
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
def query_rag():
    """Handle RAG queries and return relevant images"""
    global chain_multimodal_rag, retriever_multi_vector_img, image_metadata_store
    
    if chain_multimodal_rag is None:
        return jsonify({'error': 'Please upload documents first. The RAG chain is not initialized.'}), 400
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        print(f"Processing query: {query}")
        
        # Get relevant documents - use similarity_search to get more control
        docs = retriever_multi_vector_img.vectorstore.similarity_search(query, k=10)
        
        # Debug: print retrieved document info
        print(f"Retrieved {len(docs)} documents")
        for i, doc in enumerate(docs):
            print(f"Doc {i}: type={doc.metadata.get('type')}, doc_id={doc.metadata.get('doc_id')}")
        
        # Extract relevant images from results
        relevant_images = []
        for doc in docs:
            try:
                # Check if this is an image document from the vector store
                if hasattr(doc, 'metadata') and doc.metadata.get('type') == 'image':
                    doc_id = doc.metadata.get('doc_id')
                    print(f"Processing image doc with ID: {doc_id}")
                    
                    if doc_id:
                        # Get the stored content from docstore
                        stored_items = retriever_multi_vector_img.docstore.mget([doc_id])
                        if stored_items and stored_items[0] is not None:
                            try:
                                stored_content = json.loads(stored_items[0])
                                doc_type = stored_content.get('type')
                                print(f"Stored doc type: {doc_type}")
                                
                                if doc_type == 'image':
                                    metadata = stored_content.get('metadata', {})
                                    print(f"Image metadata: {metadata}")
                                    
                                    # Find matching image in our metadata store
                                    for image_meta in image_metadata_store:
                                        if (image_meta['filename'] == metadata.get('filename') and
                                            image_meta['pdf_source'] == metadata.get('pdf_source')):
                                            relevant_images.append({
                                                'filename': image_meta['filename'],
                                                'pdf_source': image_meta['pdf_source'],
                                                'page_number': image_meta['page_number'],
                                                'image_index': image_meta['image_index'],
                                                'preview_url': f"/api/images/{os.path.basename(image_meta['path'])}",
                                                'base64_preview': resize_base64_image(image_meta['base64'], size=(300, 200))
                                            })
                                            print(f"Added relevant image: {image_meta['filename']}")
                                            break
                            except json.JSONDecodeError as e:
                                print(f"Error parsing stored content: {e}")
                        else:
                            print(f"No stored content found for doc_id: {doc_id}")
            except Exception as e:
                print(f"Error processing document for images: {e}")
                continue
        
        # Remove duplicates
        unique_images = []
        seen_filenames = set()
        for img in relevant_images:
            if img['filename'] not in seen_filenames:
                unique_images.append(img)
                seen_filenames.add(img['filename'])
        
        # Process through RAG chain
        result = chain_multimodal_rag.invoke(query)
        
        return jsonify({
            'answer': result,
            'relevant_docs_count': len(docs),
            'relevant_images': unique_images[:3]  # Return max 3 relevant images
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in query endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    """Serve extracted images"""
    images_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'extracted_images')
    return send_from_directory(images_dir, filename)

@app.route('/api/uploaded_images/<path:filename>')
def serve_uploaded_image(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)