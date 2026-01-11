import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Upload, FileText, MessageCircle, Image, Send, Loader2, Copy, Check } from 'lucide-react';

interface UploadDetails {
  text_chunks: number;
  images_uploaded: number;
  images_extracted_from_pdf: number;
  total_images: number;
  message: string;
}

interface RelevantImage {
  filename: string;
  pdf_source: string;
  page_number?: number;
  base64_preview?: string;
  preview_url?: string;
}

const PdfChat = () => {
const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null);
  const [relevantImages, setRelevantImages] = useState<RelevantImage[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(response.data.message);
      setUploadDetails(response.data);
      setRelevantImages([]); // Clear previous images
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('Error uploading files: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/query', { query });
      setAnswer(response.data.answer);
      setRelevantImages(response.data.relevant_images || []);
    } catch (error: any) {
      console.error('Query error:', error);
      setAnswer('Error: ' + (error.response?.data?.error || error.message));
      setRelevantImages([]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#E4D7B4] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#335441] mb-3">
              PDF Chat Assistant
            </h1>
            <p className="text-lg text-[#6B8F60] mb-2">
              Upload PDFs and images, then ask questions about the content
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6B8F60]">
              <span className="flex items-center gap-1">
                <FileText size={16} />
                PDF Processing
              </span>
              <span className="flex items-center gap-1">
                <Image size={16} />
                Image Extraction
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} />
                AI-Powered Q&A
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Upload Section */}
          <div className="space-y-6">
            {/* File Upload Card */}
            <div className="bg-white rounded-xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#335441] to-[#6B8F60] p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Upload size={20} />
                  Upload Documents
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-[#E4D7B4] rounded-lg p-6 text-center hover:border-[#6B8F60] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-[#F9F6EE] rounded-full flex items-center justify-center">
                      <FileText className="text-[#6B8F60]" size={24} />
                    </div>
                    <div>
                      <p className="text-[#335441] font-medium">Choose files or drag and drop</p>
                      <p className="text-sm text-[#6B8F60]">PDF, JPG, JPEG, PNG files</p>
                    </div>
                  </label>
                </div>

                {/* Upload Button */}
                <button 
                  onClick={handleUpload} 
                  disabled={loading || files.length === 0}
                  className="w-full bg-[#335441] text-white py-3 px-4 rounded-lg font-medium 
                           hover:bg-[#2a4536] disabled:bg-gray-300 disabled:cursor-not-allowed 
                           transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Files
                    </>
                  )}
                </button>

                {/* Upload Status */}
                {uploadStatus && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">{uploadStatus}</p>
                  </div>
                )}

                {/* Upload Details */}
                {uploadDetails && (
                  <div className="bg-[#F9F6EE] border border-[#E4D7B4] rounded-lg p-4">
                    <h4 className="font-medium text-[#335441] mb-2">Processing Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-[#6B8F60]">Text chunks: <span className="font-medium text-[#335441]">{uploadDetails.text_chunks}</span></div>
                      <div className="text-[#6B8F60]">Images uploaded: <span className="font-medium text-[#335441]">{uploadDetails.images_uploaded}</span></div>
                      <div className="text-[#6B8F60]">Images extracted: <span className="font-medium text-[#335441]">{uploadDetails.images_extracted_from_pdf}</span></div>
                      <div className="text-[#6B8F60]">Total images: <span className="font-medium text-[#335441]">{uploadDetails.total_images}</span></div>
                    </div>
                  </div>
                )}

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#335441] mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-[#6B8F60] truncate">{file.name}</span>
                          <span className="bg-[#E4D7B4] text-[#335441] px-2 py-1 rounded text-xs font-medium">
                            {file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Query Section */}
          <div className="space-y-6">
            {/* Query Card */}
            <div className="bg-white rounded-xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#335441] to-[#6B8F60] p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MessageCircle size={20} />
                  Ask Questions
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Query Input */}
                <div className="space-y-2">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your question here... (e.g., 'What does the chart show?', 'Summarize the document', 'Show me relevant images', etc.)"
                    rows={6}
                    className="w-full p-4 border-2 border-[#E4D7B4] rounded-lg focus:border-[#6B8F60] 
                             focus:outline-none resize-none text-[#335441] placeholder-gray-400"
                  />
                </div>

                {/* Query Button */}
                <button 
                  onClick={handleQuery} 
                  disabled={loading || !query.trim()}
                  className="w-full bg-[#6B8F60] text-white py-3 px-4 rounded-lg font-medium 
                           hover:bg-[#5a8a54] disabled:bg-gray-300 disabled:cursor-not-allowed 
                           transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Ask Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Section */}
        {answer && (
          <div className="mt-8">
            <div className="bg-white rounded-xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#335441] to-[#6B8F60] p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MessageCircle size={20} />
                  Answer
                </h2>
              </div>
              
              <div className="p-6">
                <div className="bg-[#F9F6EE] border-l-4 border-[#6B8F60] p-6 rounded-lg">
                  <div className="text-[#335441] leading-relaxed prose prose-green max-w-none prose-headings:text-[#335441] prose-p:text-[#335441] prose-li:text-[#335441] prose-strong:text-[#335441] prose-a:text-[#6B8F60] hover:prose-a:text-[#335441]">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-[#335441] mb-4 mt-6 first:mt-0" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-[#335441] mb-3 mt-5 first:mt-0" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-medium text-[#335441] mb-2 mt-4 first:mt-0" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-medium text-[#335441] mb-2 mt-3 first:mt-0" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-[#335441] leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-[#335441] space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-[#335441] space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-[#335441] leading-relaxed" {...props} />,
                        code: ({node, className, children, ...props}: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          const isInline = !match;
                          const codeString = String(children).replace(/\n$/, '');
                          
                          return isInline ? (
                            <code className="bg-gray-100 text-[#335441] px-1 py-0.5 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="relative group mb-4">
                              <button
                                onClick={() => copyToClipboard(codeString)}
                                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-lg 
                                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                         text-gray-600 hover:text-[#335441] z-10"
                                title="Copy code"
                              >
                                {copiedCode === codeString ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                              <SyntaxHighlighter
                                style={tomorrow}
                                language={language}
                                PreTag="div"
                                className="rounded-lg !mt-0"
                                customStyle={{
                                  backgroundColor: '#f8f9fa',
                                  border: '1px solid #E4D7B4',
                                  borderRadius: '8px',
                                  padding: '16px',
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#6B8F60] pl-4 italic text-[#6B8F60] mb-3" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-[#335441]" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-[#6B8F60]" {...props} />,
                        a: ({node, ...props}) => <a className="text-[#6B8F60] hover:text-[#335441] underline transition-colors" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full border-collapse border border-[#E4D7B4] rounded-lg overflow-hidden" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-[#335441] text-white" {...props} />,
                        th: ({node, ...props}) => <th className="border border-[#E4D7B4] p-3 text-left font-semibold" {...props} />,
                        td: ({node, ...props}) => <td className="border border-[#E4D7B4] p-3 text-[#335441]" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-6 border-[#E4D7B4]" {...props} />,
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {relevantImages.length > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm flex items-center gap-2">
                      <Image size={16} />
                      <strong>Note:</strong> {relevantImages.length} relevant image(s) were found and used in generating this answer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Relevant Images Section */}
        {relevantImages.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#335441] to-[#6B8F60] p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Image size={20} />
                  Relevant Images Found
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relevantImages.map((image, index) => (
                    <div key={index} className="bg-white border-2 border-[#E4D7B4] rounded-lg overflow-hidden 
                                              hover:shadow-lg transition-shadow duration-200">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        {image.base64_preview ? (
                          <img 
                            src={`data:image/png;base64,${image.base64_preview}`} 
                            alt={`Relevant image ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img 
                            src={image.preview_url} 
                            alt={`Relevant image ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const nextSibling = target.nextSibling as HTMLElement;
                              target.style.display = 'none';
                              if (nextSibling) nextSibling.style.display = 'flex';
                            }}
                          />
                        )}
                        <div className="hidden w-full h-full items-center justify-center text-gray-500">
                          Image not available
                        </div>
                      </div>
                      <div className="p-4 bg-[#F9F6EE]">
                        <h4 className="font-medium text-[#335441] text-sm truncate mb-1">
                          {image.filename}
                        </h4>
                        <p className="text-xs text-[#6B8F60] mb-1">Source: {image.pdf_source}</p>
                        {image.page_number && (
                          <p className="text-xs text-[#6B8F60]">Page: {image.page_number}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PdfChat