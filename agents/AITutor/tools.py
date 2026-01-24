import logging
from livekit.agents import function_tool, RunContext, get_job_context, ToolError
import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import asyncio
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from shared .env
load_dotenv(Path(__file__).parent.parent / ".env")


@function_tool()
async def send_session_summary(
    context: RunContext,
    to_email: str,
    topics_covered: str,
    key_concepts: str,
    content_reviewed: str,
    next_steps: str,
    user_name: Optional[str] = "Learner"
) -> str:
    """
    Send a session summary email to the user after the tutoring session.
    
    Args:
        to_email: Recipient email address
        topics_covered: Comma-separated list of topics discussed
        key_concepts: Key concepts explained during the session
        content_reviewed: Description of code/content reviewed
        next_steps: Recommended next steps for learning
        user_name: Optional name of the user
    """
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        gmail_user = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_APP_PASSWORD")
        
        if not gmail_user or not gmail_password:
            logging.error("Gmail credentials not found in environment variables")
            return "Email sending failed: Gmail credentials not configured."
        
        # Format the email content
        current_date = datetime.now().strftime("%B %d, %Y")
        subject = f"Your AI Tutor Session Summary - {current_date}"
        
        message_body = f"""Dear {user_name},

Thank you for your tutoring session! Here's a summary of what we covered:

📚 TOPICS DISCUSSED:
{topics_covered}

💡 KEY CONCEPTS:
{key_concepts}

📝 CONTENT REVIEWED:
{content_reviewed}

🎯 RECOMMENDED NEXT STEPS:
{next_steps}

Keep up the great work with your learning! Feel free to come back anytime you need help.

Best regards,
Your AI Tutor
PrepX Learning Platform
"""
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message_body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, [to_email], msg.as_string())
        server.quit()
        
        logging.info(f"Session summary email sent to {to_email}")
        
        # Send notification to client
        room = get_job_context().room
        participant_identity = next(iter(room.remote_participants))
        
        try:
            await asyncio.sleep(2)
            response = await room.local_participant.perform_rpc(
                destination_identity=participant_identity,
                method="client.showNotification",
                payload=json.dumps({
                    "type": "session_summary_sent",
                    "email_address": to_email
                }),
                response_timeout=30.0
            )
            logging.info(f"Notification response: {response}")
            return f"Session summary email successfully sent to {to_email}!"
        except Exception as rpc_error:
            logging.error(f"RPC error: {rpc_error}")
            return f"Session summary sent to {to_email}, but client notification failed."
            
    except smtplib.SMTPAuthenticationError:
        logging.error("Gmail authentication failed")
        return "Email sending failed: Authentication error."
    except smtplib.SMTPException as e:
        logging.error(f"SMTP error: {e}")
        return f"Email sending failed: {str(e)}"
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return f"An error occurred: {str(e)}"
