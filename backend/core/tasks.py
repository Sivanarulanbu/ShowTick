from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from email.mime.image import MIMEImage
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_async_email(self, subject, template_name, context, recipient_list, attachments=None, embedded_images=None):
    """
    Sends an async email with HTML template rendering, optional attachments, 
    and support for embedded images (CIDs).
    """
    try:
        html_content = render_to_string(f'emails/{template_name}.html', context)
        
        try:
            text_content = render_to_string(f'emails/{template_name}.txt', context)
        except Exception:
            text_content = "Please view this email in an HTML-compatible email client."

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list
        )
        email.attach_alternative(html_content, "text/html")
        email.mixed_subtype = 'related'

        # Handle embedded images (like QR codes)
        if embedded_images:
            for image_data in embedded_images:
                # image_data format: {'cid': 'qrcode', 'content': b'...', 'mimetype': 'image/png'}
                msg_img = MIMEImage(image_data['content'])
                msg_img.add_header('Content-ID', f'<{image_data["cid"]}>')
                msg_img.add_header('Content-Disposition', 'inline', filename=image_data['cid'])
                email.attach(msg_img)

        # Handle attachments (like PDF Tickets)
        if attachments:
            for attachment in attachments:
                # attachment format: {'filename': 'ticket.pdf', 'content': b'...', 'mimetype': 'application/pdf'}
                email.attach(attachment['filename'], attachment['content'], attachment['mimetype'])

        email.send(fail_silently=False)
        logger.info(f"Email '{subject}' sent successfully to {recipient_list}")

    except Exception as exc:
        logger.error(f"Error sending email to {recipient_list}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
