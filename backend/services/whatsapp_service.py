import os
import json
import logging
import urllib.request
import urllib.error
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Target WhatsApp Business recipient
DEFAULT_RECIPIENT_NUMBER = '919994887758'


class WhatsAppService:
    """
    Service for WhatsApp Business Cloud API (Meta Graph API) integration
    with automatic product image and message delivery, and safe Click-to-Chat fallback.
    """

    def __init__(self):
        self.access_token = os.getenv('WHATSAPP_CLOUD_API_ACCESS_TOKEN', '').strip()
        self.phone_number_id = os.getenv('WHATSAPP_CLOUD_API_PHONE_NUMBER_ID', '').strip()
        raw_recipient = os.getenv('WHATSAPP_BUSINESS_RECIPIENT_NUMBER', DEFAULT_RECIPIENT_NUMBER).strip()
        # Clean recipient phone number (must be international format without + or spaces)
        clean = ''.join(filter(str.isdigit, raw_recipient))
        if len(clean) == 10:
            clean = f"91{clean}"
        self.recipient_number = clean or DEFAULT_RECIPIENT_NUMBER

    def is_cloud_api_configured(self) -> bool:
        """
        Returns True only if both access token and phone number ID are present.
        """
        return bool(self.access_token and self.phone_number_id)

    def _call_graph_api(self, payload: dict) -> dict:
        """
        Executes HTTP POST to Meta WhatsApp Business Cloud API.
        """
        if not self.is_cloud_api_configured():
            return {
                'success': False,
                'error': 'WhatsApp Cloud API credentials (ACCESS_TOKEN or PHONE_NUMBER_ID) not configured.',
            }

        url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}/messages"
        headers = {
            'Authorization': f"Bearer {self.access_token}",
            'Content-Type': 'application/json',
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')

        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                response_data = json.loads(res.read().decode('utf-8'))
                messages = response_data.get('messages', [])
                msg_id = messages[0].get('id') if messages else None
                return {
                    'success': True,
                    'message_id': msg_id,
                    'raw_response': response_data,
                }
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode('utf-8'))
            except Exception:
                err_body = {'error': f"HTTP {e.code}: {e.reason}"}
            logger.error(f"WhatsApp Cloud API HTTPError: {err_body}")
            return {
                'success': False,
                'error': err_body.get('error', {}).get('message', str(err_body)),
                'status_code': e.code,
            }
        except Exception as e:
            logger.error(f"WhatsApp Cloud API Exception: {e}")
            return {
                'success': False,
                'error': str(e),
            }

    def send_image(self, recipient: str, image_url: str, caption: str = '') -> dict:
        """
        Sends an actual product image as an image attachment via WhatsApp Business Cloud API.
        """
        payload = {
            'messaging_product': 'whatsapp',
            'recipient_type': 'individual',
            'to': recipient,
            'type': 'image',
            'image': {
                'link': image_url,
            },
        }
        if caption:
            # WhatsApp captions support up to 1024 characters
            payload['image']['caption'] = caption[:1024]

        return self._call_graph_api(payload)

    def send_text(self, recipient: str, text: str) -> dict:
        """
        Sends text message via WhatsApp Business Cloud API.
        """
        payload = {
            'messaging_product': 'whatsapp',
            'recipient_type': 'individual',
            'to': recipient,
            'type': 'text',
            'text': {
                'body': text,
            },
        }
        return self._call_graph_api(payload)

    def format_order_message(
        self,
        customer_name: str,
        customer_phone: str,
        shipping_address: str,
        shipping_city: str,
        shipping_state: str,
        shipping_pincode: str,
        address_type: str,
        items: list,
        subtotal: float,
        discount: float,
        delivery_charge: float,
        grand_total: float,
        order_number: str = '',
    ) -> str:
        """
        Formats order details into the strict customer requirement message format.
        """
        lines = [
            "NEW ORDER REQUEST – RAJ BARATHAM / NATYAM GOLD",
            "",
            "CUSTOMER DETAILS:",
            f"Name: {customer_name}",
            f"Mobile: {customer_phone}",
            f"Delivery Address: {shipping_address}",
            f"City: {shipping_city}",
            f"State: {shipping_state}",
            f"PIN Code: {shipping_pincode}",
            f"Address Type: {address_type or 'Home'}",
            "",
            "ORDER DETAILS:",
            "",
        ]

        total_qty = 0
        for idx, itm in enumerate(items, 1):
            name = itm.get('name') or itm.get('product_name') or 'Jewellery Piece'
            p_id = itm.get('product_id') or itm.get('id') or 'N/A'
            img = itm.get('main_image') or itm.get('image') or itm.get('image_url') or 'N/A'
            price = float(itm.get('discounted_unit_price') or itm.get('unit_price') or itm.get('price') or 0)
            variant = itm.get('variant') or 'Standard'
            qty = int(itm.get('quantity') or 1)
            item_subtotal = float(itm.get('total_price') or (price * qty))
            total_qty += qty

            lines.append(f"{idx}. {name}")
            lines.append(f"- Product Name: {name}")
            lines.append(f"- Product ID: {p_id}")
            lines.append(f"- Product Image: {img}")
            lines.append(f"- Product Price: ₹{price:,.2f}")
            if variant and variant != 'Standard':
                lines.append(f"- Selected Variant: {variant}")
            lines.append(f"- Quantity: {qty}")
            lines.append(f"- Subtotal: ₹{item_subtotal:,.2f}")
            lines.append("")

        lines.extend([
            "ORDER SUMMARY:",
            "",
            f"Total Items: {total_qty}",
            f"Subtotal: ₹{subtotal:,.2f}",
            f"Delivery Charge: ₹{delivery_charge:,.2f}",
            f"Discount: ₹{discount:,.2f}",
            f"Grand Total: ₹{grand_total:,.2f}",
            f"Order Reference: {order_number}",
            "",
            "Thank you for choosing Raj Baratham!",
        ])

        return "\n".join(lines)

    def dispatch_order(
        self,
        order,
        items: list,
        customer_info: dict,
        calculation: dict,
    ) -> dict:
        """
        Dispatches order notification to the business WhatsApp number:
        1. If Cloud API is configured:
           - Sends actual product image attachments for each product.
           - Sends the complete formatted order summary text.
        2. If Cloud API is not configured or fails:
           - Generates safe fallback WhatsApp Click-to-Chat URL (https://wa.me/919994887758?text=...).
        """
        recipient = self.recipient_number

        # Format complete order message text
        msg_text = self.format_order_message(
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            shipping_address=order.shipping_address,
            shipping_city=order.shipping_city,
            shipping_state=order.shipping_state,
            shipping_pincode=order.shipping_pincode,
            address_type=customer_info.get('address_type', 'Home'),
            items=items,
            subtotal=float(order.subtotal),
            discount=float(order.discount_amount),
            delivery_charge=float(order.shipping_amount),
            grand_total=float(order.total_amount),
            order_number=order.order_number,
        )

        encoded_text = quote(msg_text)
        fallback_url = f"https://wa.me/{recipient}?text={encoded_text}"

        if not self.is_cloud_api_configured():
            logger.info("WhatsApp Cloud API credentials not configured. Providing Click-to-Chat fallback.")
            return {
                'mode': 'fallback_click_to_chat',
                'sent_via_cloud_api': False,
                'recipient': recipient,
                'fallback_url': fallback_url,
                'message_text': msg_text,
                'note': (
                    'WhatsApp Business Cloud API credentials (WHATSAPP_CLOUD_API_ACCESS_TOKEN, '
                    'WHATSAPP_CLOUD_API_PHONE_NUMBER_ID) not configured in backend environment. '
                    'Click-to-Chat fallback opens prefilled message; user must press send.'
                ),
            }

        # Cloud API is configured: Send actual image attachments + order summary
        image_results = []
        for itm in items:
            img_url = itm.get('main_image') or itm.get('image') or itm.get('image_url') or ''
            if img_url and img_url.startswith('http'):
                name = itm.get('name') or itm.get('product_name') or 'Jewellery Piece'
                p_id = itm.get('product_id') or itm.get('id') or ''
                qty = itm.get('quantity') or 1
                price = float(itm.get('discounted_unit_price') or itm.get('unit_price') or 0)
                caption = f"{name} (ID: {p_id}) | Qty: {qty} | Price: ₹{price:,.2f}"

                img_res = self.send_image(recipient, img_url, caption)
                image_results.append(img_res)

        # Send full order summary text
        text_res = self.send_text(recipient, msg_text)

        all_msg_ids = []
        for ir in image_results:
            if ir.get('success') and ir.get('message_id'):
                all_msg_ids.append(ir['message_id'])
        if text_res.get('success') and text_res.get('message_id'):
            all_msg_ids.append(text_res['message_id'])

        is_success = text_res.get('success', False) or any(r.get('success') for r in image_results)

        return {
            'mode': 'cloud_api' if is_success else 'fallback_click_to_chat',
            'sent_via_cloud_api': is_success,
            'recipient': recipient,
            'message_ids': all_msg_ids,
            'image_results': image_results,
            'text_result': text_res,
            'fallback_url': fallback_url,
            'message_text': msg_text,
        }


# Global singleton instance
whatsapp_service = WhatsAppService()
