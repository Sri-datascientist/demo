import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.config import settings
from app.models.order import Order

logger = logging.getLogger(__name__)

def send_order_placed_email(order: Order, user_email: str):
    """
    Sends an email notification to the user when an order is placed using SMTP.
    """
    subject = f"Order #{order.id} Placed Successfully! - Oyedesi"
    
    # Generate HTML summary of items
    items_html = ""
    for item in order.items:
        product_name = item.product.name if item.product else "Product"
        items_html += f"<tr><td>{product_name}</td><td>{item.quantity}</td><td>₹{item.price_at_purchase:.2f}</td></tr>"

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #273C46; line-height: 1.6; background-color: #f7f9f6; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e2ebd5; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }}
            .header {{ background-color: #2D5A27; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; margin: -30px -30px 20px -30px; }}
            .content {{ padding: 10px 0; }}
            .footer {{ font-size: 12px; color: #6b7c74; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }}
            .btn {{ display: inline-block; background-color: #689F38; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 30px; margin-top: 20px; font-weight: bold; text-align: center; }}
            .summary-table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            .summary-table th, .summary-table td {{ border-bottom: 1px solid #eee; padding: 12px; text-align: left; }}
            .summary-table th {{ background-color: #f8faf7; color: #2D5A27; font-weight: 600; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0; font-size: 24px;">Order Confirmed!</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for shopping with <strong>Oyedesi</strong>! Your order has been placed successfully and is being processed.</p>
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Tracking Number:</strong> {order.tracking_number}</p>
                
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <p style="font-size: 18px; font-weight: bold; margin-top: 20px; color: #2D5A27;">Total Amount: ₹{order.total_amount:.2f}</p>
                <p><strong>Shipping Address:</strong><br/>{order.shipping_address}</p>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/dashboard/track-order?tracking={order.tracking_number}" class="btn" style="color: white !important;">Track Your Shipment</a>
                </div>
            </div>
            <div class="footer">
                <p>Oyedesi - From Local Farms to Your Table</p>
                <p>This is an automated transactional notification.</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_user
        msg['To'] = user_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))
        
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"Order email successfully sent to {user_email}")
        print(f"[EMAIL SUCCESS] Order confirmation email sent to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send order email to {user_email}: {e}", exc_info=True)
        print(f"[EMAIL ERROR] Failed to send order confirmation email to {user_email}: {type(e).__name__} - {e}")


def send_order_status_update_email(order: Order, user_email: str):
    """
    Sends an email notification to the user when their order status changes.
    """
    # Map status to professional display labels
    status_labels = {
        'pending': 'Pending Confirmation',
        'confirmed': 'Confirmed',
        'processing': 'Processing & Packaging',
        'shipped': 'Dispatched & In Transit',
        'out_for_delivery': 'Out for Delivery (On the Way)',
        'delivered': 'Delivered Successfully',
        'cancelled': 'Cancelled'
    }
    
    status_label = status_labels.get(order.status.value, order.status.value.replace('_', ' ').capitalize())
    subject = f"Order #{order.id} Status Update: {status_label} - Oyedesi"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #273C46; line-height: 1.6; background-color: #f7f9f6; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e2ebd5; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }}
            .header {{ background-color: #2D5A27; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; margin: -30px -30px 20px -30px; }}
            .content {{ padding: 10px 0; }}
            .footer {{ font-size: 12px; color: #6b7c74; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }}
            .btn {{ display: inline-block; background-color: #689F38; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 30px; margin-top: 20px; font-weight: bold; text-align: center; }}
            .status-banner {{ background-color: #f0f7f0; border-left: 4px solid #2D5A27; padding: 15px; margin: 15px 0; border-radius: 4px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0; font-size: 24px;">Shipment Status Update</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>The status of your order at <strong>Oyedesi</strong> has been updated:</p>
                
                <div class="status-banner">
                    <p style="margin: 0; font-size: 16px;"><strong>New Status:</strong> {status_label}</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7c74;">Tracking ID: {order.tracking_number}</p>
                </div>
                
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Shipping Address:</strong><br/>{order.shipping_address}</p>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/dashboard/track-order?tracking={order.tracking_number}" class="btn" style="color: white !important;">View Delivery Timeline</a>
                </div>
            </div>
            <div class="footer">
                <p>Oyedesi - Fresh From Farm to Doorstep</p>
                <p>This is an automated transactional notification.</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_user
        msg['To'] = user_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))
        
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"Order status email successfully sent to {user_email}")
        print(f"[EMAIL SUCCESS] Status update email sent to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send status update email to {user_email}: {e}", exc_info=True)
        print(f"[EMAIL ERROR] Failed to send status update email to {user_email}: {type(e).__name__} - {e}")

