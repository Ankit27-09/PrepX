import requests
import pdfplumber
from io import BytesIO
from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv(".env.local")

def extract_pdf_text_from_s3_url(s3_url: str) -> str:
   """
   Downloads a PDF from a public S3 URL and extracts its text.
   Args:
      s3_url (str): Public S3 URL to the PDF file.
   Returns:
      str: Extracted text from the PDF.
   """
   response = requests.get(s3_url)
   response.raise_for_status()
   pdf_file = BytesIO(response.content)
   text = ""
   with pdfplumber.open(pdf_file) as pdf:
      for page in pdf.pages:
         text += page.extract_text() or ""
   return text

def build_resume_parsing_prompt(resume_text):
    """
    Create a detailed prompt for parsing the resume.
    :param resume_text: Text content of the resume
    :return: Formatted prompt string
    """
    return f"""
You are a resume parser.

Your task is to extract **all** information from the following resume **without missing a single detail**.  
Preserve dates, company names, project titles, descriptions, technologies, metrics, bullet points, formatting cues—everything exactly as it appears.

Organize the output into these sections, using the same wording and order as in the original:

1. Personal Information  
   • Full Name  
   • Email  
   • Phone  
   • Address (if present)  
   • Other contact methods (LinkedIn, GitHub, etc.)

2. Professional Summary  
   • Every sentence verbatim

3. Education  
   For each entry, include:  
   • Degree & Field  
   • Institution Name  
   • Location  
   • Start Date - End Date (or “Present”)  
   • Honors, GPA, thesis title, coursework—exactly as listed

4. Work Experience  
   For each role, include:  
   • Job Title  
   • Company Name  
   • Location  
   • Start Date - End Date  
   • All bullet-point achievements, responsibilities, metrics—verbatim

5. Projects  
   For each project, include:  
   • Project Name  
   • Description  
   • Technologies & tools used  
   • Links (if any)  
   • Role & duration—exactly as in the resume

6. Skills  
   • List every skill exactly as grouped or ordered

7. Certifications & Training  
   • Certification Name  
   • Issuing Organization  
   • Date Earned  
   • Credential ID (if present)

8. Awards & Honors  
   • Award Title  
   • Issuing Organization  
   • Date  
   • Context or description—verbatim

9. Publications / Patents (if any)  
   • Title  
   • Publication / Patent details  
   • Date  
   • Link

10. Additional Sections (Volunteer, Languages, Interests, etc.)  
    • Preserve section titles and every entry exactly

---

Resume:
-------
{resume_text}
"""

groq_api_key = os.getenv("GROQ_API_KEY") 
client = Groq(api_key=GROQ_API_KEY)

def query_groq(prompt, model="llama-3.3-70b-versatile"):
    """
    Query the Groq LLM with a prompt and return the response.
    :param prompt: The prompt to send to the model
    :param model: The model to use (default: llama-3.3-70b-versatile)
    :return: Model response
    """
    chat_completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return chat_completion.choices[0].message.content
