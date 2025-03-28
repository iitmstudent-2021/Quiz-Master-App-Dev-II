import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from jinja2 import Template
import os

# SMTP Configuration (Use Environment Variables for Security)
SMTP_SERVER_HOST = os.getenv("SMTP_SERVER_HOST", "smtp.gmail.com")  # Use Gmail or any other SMTP
SMTP_SERVER_PORT = int(os.getenv("SMTP_SERVER_PORT", 587))  # 587 for TLS, 465 for SSL
SENDER_ADDRESS = os.getenv("SENDER_ADDRESS", "quizmaster@donotreply.com")  
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your_app_password_here")  # Use an app-specific password!

# ──────────────────────────────────────────────────────────
# Function to Send Emails
# ──────────────────────────────────────────────────────────
def send_email(to_address, subject, message, content="html", attachment_file=None):
    """
    Send an email with optional attachment.

    Parameters:
        to_address (str): Recipient email address
        subject (str): Email subject
        message (str): Email content
        content (str): Email format ("html" or "plain"). Default: "html"
        attachment_file (str): Path to attachment file (optional)

    Returns:
        bool: True if email is sent successfully
    """
    try:
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = SENDER_ADDRESS
        msg['To'] = to_address
        msg['Subject'] = subject

        # Attach message content
        if content == "html":
            msg.attach(MIMEText(message, "html"))
        else:
            msg.attach(MIMEText(message, "plain"))

        # Attach file if provided
        if attachment_file and os.path.exists(attachment_file):
            with open(attachment_file, 'rb') as attachment:
                part = MIMEBase("application", "octet-stream")  # File attachment as octet-stream
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)  # Encode file in base64
            part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(attachment_file)}")
            msg.attach(part)

        # Establish SMTP connection
        with smtplib.SMTP(SMTP_SERVER_HOST, SMTP_SERVER_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SENDER_ADDRESS, SENDER_PASSWORD)
            server.send_message(msg)

        print(f"Email sent to {to_address} - Subject: {subject}")
        return True
    
    except Exception as e:
        print(f"Failed to send email to {to_address}. Error: {str(e)}")
        return False
