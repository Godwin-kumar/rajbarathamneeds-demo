import json
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication

from apps.products.models import Product
from apps.promotions.models import Promotion
from apps.customers.models import Customer
from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from services.whatsapp_service import whatsapp_service


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication for customer-facing store API endpoints.
    Allows guest shoppers and cross-origin frontend requests without requiring
    Django CSRF cookie/token validation on state-changing API calls, while
    authenticating existing session users if credentials are provided.
    """
    def enforce_csrf(self, request):
        return


def get_product_summary_data(product):
    """
    Returns complete product metadata dictionary for checkout and order processing.
    """
    import re
    img = product.main_image or ''
    if not img and hasattr(product, 'side_images') and product.side_images.exists():
        img = product.side_images.first().image_url
    if not img:
        img = '/images/products/temple_jewellery.jpg'

    category_name = product.category.name if product.category else 'Traditional Jewellery'
    sku = product.dimensions if (product.dimensions and ('-' in product.dimensions or 'SKU' in product.dimensions.upper())) else f"NG-{product.id:04d}"

    text = f"{product.dimensions or ''} {product.description or ''}"
    weight_match = re.search(r'(\d+(?:\.\d+)?\s*(?:g|gm|grams|kg))', text, re.IGNORECASE)
    weight = weight_match.group(1) if weight_match else (product.dimensions if product.dimensions and not '-' in product.dimensions else None)

    return {
        'id': product.id,
        'product_id': product.id,
        'name': product.name,
        'product_name': product.name,
        'sku': sku,
        'product_code': sku,
        'category': category_name,
        'category_name': category_name,
        'weight': weight,
        'dimensions': product.dimensions or '',
        'price': float(product.price or 0),
        'unit_price': float(product.price or 0),
        'main_image': img,
        'image': img,
        'image_url': img,
        'description': product.description or '',
    }


def calculate_product_checkout(product, quantity=1, variant=None):
    """
    Computes verified price, product details and promotion discount from database.
    """
    qty = max(1, int(quantity or 1))
    unit_price = Decimal(str(product.price or 0))

    # Check for active promotion specifically linked to this product
    promo = Promotion.objects.filter(product_id=product.id, is_active=True).first()
    discount_per_unit = Decimal('0.00')
    promo_details = None

    if promo:
        if promo.discount_type == 'PERCENTAGE':
            pct = Decimal(str(promo.discount_value or 0))
            discount_per_unit = (unit_price * pct / Decimal('100')).quantize(Decimal('0.01'))
        elif promo.discount_type == 'FLAT':
            flat_val = Decimal(str(promo.discount_value or 0))
            discount_per_unit = min(unit_price, flat_val).quantize(Decimal('0.01'))

        promo_details = {
            'id': promo.id,
            'title': promo.title,
            'discount_type': promo.discount_type,
            'discount_value': float(promo.discount_value),
            'formatted_discount': (
                f"{int(promo.discount_value)}% OFF"
                if promo.discount_type == 'PERCENTAGE'
                else f"FLAT ₹{int(promo.discount_value):,} OFF"
            ),
        }

    discounted_unit_price = max(Decimal('0.00'), unit_price - discount_per_unit)
    original_total = (unit_price * qty).quantize(Decimal('0.01'))
    total_savings = (discount_per_unit * qty).quantize(Decimal('0.01'))
    final_total = (discounted_unit_price * qty).quantize(Decimal('0.01'))
    delivery_charge = Decimal('0.00')  # Free shipping across India

    prod_info = get_product_summary_data(product)

    return {
        'product': prod_info,
        'product_id': product.id,
        'product_name': product.name,
        'name': product.name,
        'sku': prod_info['sku'],
        'product_code': prod_info['sku'],
        'category': prod_info['category'],
        'category_name': prod_info['category_name'],
        'weight': prod_info['weight'],
        'variant': variant or None,
        'image': prod_info['image'],
        'image_url': prod_info['image_url'],
        'main_image': prod_info['main_image'],
        'quantity': qty,
        'price': float(unit_price),
        'unit_price': float(unit_price),
        'discount_per_unit': float(discount_per_unit),
        'discounted_unit_price': float(discounted_unit_price),
        'subtotal': float(original_total),
        'original_total': float(original_total),
        'total_price': float(final_total),
        'savings': float(total_savings),
        'total_savings': float(total_savings),
        'delivery_charge': float(delivery_charge),
        'final_total': float(final_total),
        'promotion': promo_details,
    }


def calculate_cart_checkout(items_data, coupon_code=''):
    """
    Computes verified calculations for a list of cart items.
    Validates each product in the database, applies product promotions and coupons.
    """
    calculated_items = []
    subtotal_dec = Decimal('0.00')
    promo_savings_dec = Decimal('0.00')
    total_qty = 0

    if not items_data or not isinstance(items_data, list):
        return {
            'items': [],
            'items_count': 0,
            'subtotal': 0.0,
            'total_quantity': 0,
            'coupon_code': '',
            'coupon_valid': False,
            'coupon_message': '',
            'coupon_discount': 0.0,
            'other_discounts': 0.0,
            'total_savings': 0.0,
            'delivery_charge': 0.0,
            'final_total': 0.0,
        }

    for item in items_data:
        p_id = item.get('product_id') or item.get('id')
        p_qty = max(1, int(item.get('quantity', 1)))
        variant_info = item.get('variant') or item.get('selectedVariant')
        try:
            prod_obj = Product.objects.select_related('category').prefetch_related('side_images').get(id=p_id)
        except Product.DoesNotExist:
            continue

        item_calc = calculate_product_checkout(prod_obj, p_qty, variant=variant_info)
        calculated_items.append(item_calc)
        subtotal_dec += Decimal(str(item_calc['original_total']))
        promo_savings_dec += Decimal(str(item_calc['total_savings']))
        total_qty += p_qty

    # Coupon Calculation
    coupon_discount_dec = Decimal('0.00')
    coupon_valid = False
    coupon_message = ''
    clean_coupon = str(coupon_code or '').strip().upper()

    if clean_coupon:
        if clean_coupon in ('WELCOME10', 'NATYAM10'):
            coupon_discount_dec = (subtotal_dec * Decimal('0.10')).quantize(Decimal('0.01'))
            coupon_valid = True
            coupon_message = '10% promotional privilege applied successfully.'
        elif clean_coupon in ('FLAT500', 'GOLD500'):
            if subtotal_dec >= Decimal('2000.00'):
                coupon_discount_dec = min(subtotal_dec, Decimal('500.00'))
                coupon_valid = True
                coupon_message = 'Flat ₹500 privileged savings applied.'
            else:
                coupon_message = 'Coupon requires minimum order of ₹2,000.'
        elif clean_coupon == 'FESTIVE15':
            if subtotal_dec >= Decimal('5000.00'):
                coupon_discount_dec = min(Decimal('1500.00'), (subtotal_dec * Decimal('0.15')).quantize(Decimal('0.01')))
                coupon_valid = True
                coupon_message = '15% Festive privilege applied.'
            else:
                coupon_message = 'Coupon requires minimum order of ₹5,000.'
        else:
            coupon_message = f"Coupon code '{clean_coupon}' is not valid or expired."

    delivery_charge_dec = Decimal('0.00')  # Free insured logistics
    effective_discount = promo_savings_dec + coupon_discount_dec
    final_total_dec = max(Decimal('0.00'), subtotal_dec - effective_discount)

    return {
        'items': calculated_items,
        'items_count': len(calculated_items),
        'subtotal': float(subtotal_dec),
        'total_quantity': total_qty,
        'coupon_code': clean_coupon if coupon_valid else '',
        'coupon_valid': coupon_valid,
        'coupon_message': coupon_message,
        'coupon_discount': float(coupon_discount_dec),
        'other_discounts': float(promo_savings_dec),
        'total_savings': float(effective_discount),
        'delivery_charge': float(delivery_charge_dec),
        'final_total': float(final_total_dec),
    }


class CheckoutCalculateView(APIView):
    """
    POST /api/orders/calculate/
    Validates product ID or cart items list with quantities from backend
    and returns verified pricing breakdown.
    Supports:
    - Single product: { "product_id": 1, "quantity": 1, "coupon_code": "..." }
    - Multi-item cart: { "items": [{ "product_id": 1, "quantity": 2 }], "coupon_code": "..." }
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        items = request.data.get('items')
        coupon_code = request.data.get('coupon_code', '')
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        # 1. Cart mode if items array is provided
        if items is not None and isinstance(items, list):
            cart_calc = calculate_cart_checkout(items, coupon_code=coupon_code)
            return Response(cart_calc, status=status.HTTP_200_OK)

        # 2. Single product flow
        if not product_id:
            return Response(
                {'error': 'Either product_id or items array is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.select_related('category').prefetch_related('side_images').get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': f"Product with ID '{product_id}' not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_calc = calculate_cart_checkout(
            [{'product_id': product.id, 'quantity': quantity}],
            coupon_code=coupon_code
        )
        if cart_calc['items']:
            first_item = cart_calc['items'][0]
            cart_calc['product'] = first_item['product']
            cart_calc['unit_price'] = first_item['unit_price']
            cart_calc['discount_per_unit'] = first_item['discount_per_unit']
            cart_calc['discounted_unit_price'] = first_item['discounted_unit_price']
            cart_calc['original_total'] = cart_calc['subtotal']
            cart_calc['promotion'] = first_item['promotion']

        return Response(cart_calc, status=status.HTTP_200_OK)


class AddressManagementView(APIView):
    """
    GET, POST, DELETE /api/orders/addresses/
    Manages customer delivery addresses stored in PostgreSQL database.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        raw_phone = request.query_params.get('phone', '').strip()
        if raw_phone in ('[object Object]', '[objectObject]', 'undefined', 'null', 'None'):
            raw_phone = ''
        phone = raw_phone.replace(' ', '').replace('+91', '')
        if phone in ('[objectObject]', 'undefined', 'null'):
            phone = ''

        if not phone and request.user.is_authenticated:
            customer = Customer.objects.filter(user=request.user).first()
        elif phone and any(c.isdigit() for c in phone):
            customer = Customer.objects.filter(phone__icontains=phone).first()
        else:
            customer = None

        addresses = []
        if customer:
            # Parse saved addresses stored in customer notes
            if customer.notes and customer.notes.startswith('{'):
                try:
                    notes_data = json.loads(customer.notes)
                    addresses = notes_data.get('saved_addresses', [])
                except Exception:
                    addresses = []

            # If no addresses in notes, build from primary customer record
            if not addresses and customer.address_line1:
                addresses.append({
                    'id': f"addr-{customer.id}-1",
                    'full_name': customer.name,
                    'phone': customer.phone,
                    'pincode': customer.pincode or '',
                    'house_building': customer.address_line1 or '',
                    'street_area': customer.address_line2 or '',
                    'landmark': '',
                    'city': customer.city or '',
                    'state': customer.state or '',
                    'address_type': 'Home',
                    'is_default': True,
                })

        return Response({'addresses': addresses}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        full_name = str(data.get('full_name', '')).strip()
        phone = str(data.get('phone', '')).strip().replace(' ', '').replace('+91', '')
        pincode = str(data.get('pincode', '')).strip()
        house_building = str(data.get('house_building', '')).strip()
        street_area = str(data.get('street_area', '')).strip()
        landmark = str(data.get('landmark', '')).strip()
        city = str(data.get('city', '')).strip()
        state_val = str(data.get('state', '')).strip()
        address_type = str(data.get('address_type', 'Home')).strip() or 'Home'
        is_default = bool(data.get('is_default', False))
        address_id = str(data.get('id', '')).strip()

        # Validation
        if not full_name:
            return Response({'error': 'Full name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not phone or len(phone) < 10:
            return Response({'error': 'Please enter a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)
        if not pincode or len(pincode) != 6 or not pincode.isdigit():
            return Response({'error': 'Please enter a valid 6-digit Indian PIN code.'}, status=status.HTTP_400_BAD_REQUEST)
        if not house_building:
            return Response({'error': 'House / Flat / Building name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not street_area:
            return Response({'error': 'Road / Street / Area is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not city:
            return Response({'error': 'City is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not state_val:
            return Response({'error': 'State is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create customer in PostgreSQL
        customer = Customer.objects.filter(phone=phone).first()
        if not customer:
            customer = Customer.objects.create(
                name=full_name,
                phone=phone,
                address_line1=house_building,
                address_line2=street_area,
                city=city,
                state=state_val,
                pincode=pincode,
                notes='{}',
            )

        # Load existing addresses
        saved_addresses = []
        if customer.notes and customer.notes.startswith('{'):
            try:
                notes_data = json.loads(customer.notes)
                saved_addresses = notes_data.get('saved_addresses', [])
            except Exception:
                saved_addresses = []

        if is_default:
            for addr in saved_addresses:
                addr['is_default'] = False

        if address_id:
            # Update existing address
            found = False
            for i, addr in enumerate(saved_addresses):
                if str(addr.get('id')) == address_id:
                    saved_addresses[i] = {
                        'id': address_id,
                        'full_name': full_name,
                        'phone': phone,
                        'pincode': pincode,
                        'house_building': house_building,
                        'street_area': street_area,
                        'landmark': landmark,
                        'city': city,
                        'state': state_val,
                        'address_type': address_type,
                        'is_default': is_default,
                    }
                    found = True
                    break
            if not found:
                saved_addresses.append({
                    'id': address_id,
                    'full_name': full_name,
                    'phone': phone,
                    'pincode': pincode,
                    'house_building': house_building,
                    'street_area': street_area,
                    'landmark': landmark,
                    'city': city,
                    'state': state_val,
                    'address_type': address_type,
                    'is_default': is_default or len(saved_addresses) == 0,
                })
        else:
            # Create new address
            new_id = f"addr-{customer.id}-{len(saved_addresses) + 1}"
            saved_addresses.append({
                'id': new_id,
                'full_name': full_name,
                'phone': phone,
                'pincode': pincode,
                'house_building': house_building,
                'street_area': street_area,
                'landmark': landmark,
                'city': city,
                'state': state_val,
                'address_type': address_type,
                'is_default': is_default or len(saved_addresses) == 0,
            })

        # Save to PostgreSQL customer record
        customer.name = full_name
        customer.address_line1 = house_building
        customer.address_line2 = street_area
        customer.city = city
        customer.state = state_val
        customer.pincode = pincode
        customer.notes = json.dumps({'saved_addresses': saved_addresses})
        customer.save()

        return Response({
            'message': 'Address saved successfully.',
            'addresses': saved_addresses,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request):
        phone = request.data.get('phone', '').strip().replace(' ', '').replace('+91', '')
        address_id = request.data.get('address_id')

        if not phone or not address_id:
            return Response({'error': 'Phone and address_id required.'}, status=status.HTTP_400_BAD_REQUEST)

        customer = Customer.objects.filter(phone=phone).first()
        if not customer:
            return Response({'error': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        saved_addresses = []
        if customer.notes and customer.notes.startswith('{'):
            try:
                notes_data = json.loads(customer.notes)
                saved_addresses = notes_data.get('saved_addresses', [])
            except Exception:
                saved_addresses = []

        saved_addresses = [a for a in saved_addresses if str(a.get('id')) != str(address_id)]
        customer.notes = json.dumps({'saved_addresses': saved_addresses})
        customer.save()

        return Response({'message': 'Address deleted.', 'addresses': saved_addresses}, status=status.HTTP_200_OK)


class CreateOrderView(APIView):
    """
    POST /api/orders/create/
    Creates a new customer order with PENDING status in PostgreSQL database,
    safely verifying prices and calculations on backend before returning order details.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        items_payload = request.data.get('items', [])
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        addr = request.data.get('address', {})
        coupon_code = request.data.get('coupon_code', '')

        if not items_payload and not product_id:
            return Response({'error': 'Either product_id or items list is required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = None
        if product_id:
            try:
                product = Product.objects.select_related('category').prefetch_related('side_images').get(id=product_id)
            except Product.DoesNotExist:
                if not items_payload:
                    return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Address validation
        full_name = str(addr.get('full_name', '')).strip()
        phone = str(addr.get('phone', '')).strip().replace(' ', '').replace('+91', '')
        house_building = str(addr.get('house_building', '')).strip()
        street_area = str(addr.get('street_area', '')).strip()
        landmark = str(addr.get('landmark', '')).strip()
        city = str(addr.get('city', '')).strip()
        state_val = str(addr.get('state', '')).strip()
        pincode = str(addr.get('pincode', '')).strip()
        address_type = str(addr.get('address_type', 'Home')).strip() or 'Home'

        if not full_name:
            return Response({'error': 'Customer full name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not phone or len(phone) < 10:
            return Response({'error': 'Valid 10-digit mobile number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not pincode or len(pincode) != 6:
            return Response({'error': 'Valid 6-digit PIN code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not house_building or not street_area or not city or not state_val:
            return Response({'error': 'Complete delivery address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve or create customer record
        customer, _ = Customer.objects.get_or_create(
            phone=phone,
            defaults={
                'name': full_name,
                'address_line1': house_building,
                'address_line2': street_area,
                'city': city,
                'state': state_val,
                'pincode': pincode,
            }
        )

        full_shipping_text = f"{house_building}, {street_area}"
        if landmark:
            full_shipping_text += f", Landmark: {landmark}"

        # Associate user if authenticated
        customer_email = request.data.get('email', '') or addr.get('email', '')
        if request.user.is_authenticated:
            if not customer.user:
                customer.user = request.user
                customer.save(update_fields=['user'])
            if not customer_email:
                customer_email = request.user.email or ''

        # Support multi-item order if provided
        if items_payload and isinstance(items_payload, list) and len(items_payload) > 0:
            cart_calc = calculate_cart_checkout(items_payload, coupon_code=coupon_code)
            order_items_to_create = cart_calc['items']

            if not order_items_to_create:
                return Response({'error': 'No valid products found in order.'}, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(
                customer=customer,
                customer_name=full_name,
                customer_email=customer_email or customer.email or '',
                customer_phone=phone,
                shipping_address=full_shipping_text,
                shipping_city=city,
                shipping_state=state_val,
                shipping_pincode=pincode,
                status=OrderStatus.CONFIRMED,
                payment_status=PaymentStatus.PAID,
                payment_method=PaymentMethod.ONLINE,
                subtotal=Decimal(str(cart_calc['subtotal'])),
                discount_amount=Decimal(str(cart_calc['total_savings'])),
                shipping_amount=Decimal('0.00'),
                total_amount=Decimal(str(cart_calc['final_total'])),
                coupon_code=cart_calc['coupon_code'] or None,
                notes=f"Cart Checkout. Address Type: {address_type}",
            )

            for itm in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product_id=itm['product_id'],
                    product_name=itm['name'],
                    product_sku=itm['sku'],
                    unit_price=Decimal(str(itm['discounted_unit_price'])),
                    quantity=itm['quantity'],
                    total_price=Decimal(str(itm['total_price'])),
                )

            # WhatsApp dispatch (Cloud API if configured, otherwise Click-to-Chat fallback)
            customer_info = {
                'full_name': full_name,
                'phone': phone,
                'shipping_address': full_shipping_text,
                'city': city,
                'state': state_val,
                'pincode': pincode,
                'address_type': address_type,
            }
            whatsapp_result = whatsapp_service.dispatch_order(
                order=order,
                items=order_items_to_create,
                customer_info=customer_info,
                calculation=cart_calc,
            )

            if whatsapp_result.get('sent_via_cloud_api'):
                msg_ids = ', '.join(whatsapp_result.get('message_ids', []))
                order.notes = f"{order.notes} | WhatsApp Cloud API: Sent (IDs: {msg_ids})"
            else:
                order.notes = f"{order.notes} | WhatsApp: Fallback Click-to-Chat"
            order.save(update_fields=['notes'])

            return Response({
                'order_id': order.id,
                'order_number': order.order_number,
                'total_amount': float(cart_calc['final_total']),
                'items_count': len(order_items_to_create),
                'summary': cart_calc,
                'whatsapp': whatsapp_result,
                'message': 'Order successfully placed and recorded in database.',
            }, status=status.HTTP_201_CREATED)

        # Single product flow (Buy Now)
        calc = calculate_product_checkout(product, quantity)
        subtotal_dec = Decimal(str(calc['original_total']))
        promo_savings_dec = Decimal(str(calc['total_savings']))
        coupon_discount_dec = Decimal('0.00')
        clean_coupon = str(coupon_code or '').strip().upper()
        if clean_coupon:
            if clean_coupon in ('WELCOME10', 'NATYAM10'):
                coupon_discount_dec = (subtotal_dec * Decimal('0.10')).quantize(Decimal('0.01'))
            elif clean_coupon in ('FLAT500', 'GOLD500') and subtotal_dec >= Decimal('2000.00'):
                coupon_discount_dec = min(subtotal_dec, Decimal('500.00'))
            elif clean_coupon == 'FESTIVE15' and subtotal_dec >= Decimal('5000.00'):
                coupon_discount_dec = min(Decimal('1500.00'), (subtotal_dec * Decimal('0.15')).quantize(Decimal('0.01')))

        total_savings_dec = promo_savings_dec + coupon_discount_dec
        final_total_dec = max(Decimal('0.00'), subtotal_dec - total_savings_dec)

        order = Order.objects.create(
            customer=customer,
            customer_name=full_name,
            customer_email=customer_email or customer.email or '',
            customer_phone=phone,
            shipping_address=full_shipping_text,
            shipping_city=city,
            shipping_state=state_val,
            shipping_pincode=pincode,
            status=OrderStatus.CONFIRMED,
            payment_status=PaymentStatus.PAID,
            payment_method=PaymentMethod.ONLINE,
            subtotal=subtotal_dec,
            discount_amount=total_savings_dec,
            shipping_amount=Decimal('0.00'),
            total_amount=final_total_dec,
            coupon_code=clean_coupon if coupon_discount_dec > 0 else None,
            notes=f"Buy Now Checkout. Address Type: {address_type}",
        )

        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=calc['name'],
            product_sku=calc['sku'],
            unit_price=Decimal(str(calc['discounted_unit_price'])),
            quantity=calc['quantity'],
            total_price=final_total_dec,
        )

        # WhatsApp dispatch (Cloud API if configured, otherwise Click-to-Chat fallback)
        customer_info = {
            'full_name': full_name,
            'phone': phone,
            'shipping_address': full_shipping_text,
            'city': city,
            'state': state_val,
            'pincode': pincode,
            'address_type': address_type,
        }
        single_item_data = [{
            'id': product.id,
            'product_id': product.id,
            'name': calc['name'],
            'product_name': calc['name'],
            'sku': calc['sku'],
            'main_image': calc.get('main_image') or calc.get('image') or (product.main_image or ''),
            'discounted_unit_price': calc['discounted_unit_price'],
            'unit_price': calc['unit_price'],
            'quantity': calc['quantity'],
            'total_price': float(final_total_dec),
            'variant': calc.get('variant'),
        }]
        whatsapp_result = whatsapp_service.dispatch_order(
            order=order,
            items=single_item_data,
            customer_info=customer_info,
            calculation=calc,
        )

        if whatsapp_result.get('sent_via_cloud_api'):
            msg_ids = ', '.join(whatsapp_result.get('message_ids', []))
            order.notes = f"{order.notes} | WhatsApp Cloud API: Sent (IDs: {msg_ids})"
        else:
            order.notes = f"{order.notes} | WhatsApp: Fallback Click-to-Chat"
        order.save(update_fields=['notes'])

        return Response({
            'order_id': order.id,
            'order_number': order.order_number,
            'total_amount': float(final_total_dec),
            'summary': calc,
            'whatsapp': whatsapp_result,
            'message': 'Order successfully placed and recorded in database.',
        }, status=status.HTTP_201_CREATED)


class CustomerOrdersListView(APIView):
    """
    GET /api/orders/my-orders/
    Returns orders list for the currently logged in user or queried by phone/email.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db.models import Q
        user = request.user
        phone = request.query_params.get('phone', '').strip().replace(' ', '').replace('+91', '')
        email = request.query_params.get('email', '').strip().lower()

        orders_qs = Order.objects.none()

        if user and user.is_authenticated:
            customer = Customer.objects.filter(user=user).first()
            query = Q()
            if customer:
                query |= Q(customer=customer)
                if customer.phone:
                    query |= Q(customer_phone__icontains=customer.phone.replace(' ', '').replace('+91', ''))
            if user.email:
                query |= Q(customer_email__iexact=user.email)
            if query:
                orders_qs = Order.objects.filter(query)
        elif phone and any(c.isdigit() for c in phone):
            orders_qs = Order.objects.filter(customer_phone__icontains=phone)
        elif email and '@' in email:
            orders_qs = Order.objects.filter(customer_email__iexact=email)

        orders_qs = orders_qs.order_by('-created_at')

        results = []
        for ord_obj in orders_qs:
            items_data = []
            for item in ord_obj.items.all():
                img = ''
                if item.product and item.product.main_image:
                    img = item.product.main_image
                elif item.product and hasattr(item.product, 'side_images') and item.product.side_images.exists():
                    img = item.product.side_images.first().image_url

                items_data.append({
                    'id': item.id,
                    'product_id': item.product_id,
                    'product_name': item.product_name,
                    'product_sku': item.product_sku,
                    'unit_price': float(item.unit_price),
                    'quantity': item.quantity,
                    'total_price': float(item.total_price),
                    'image': img,
                })

            results.append({
                'id': ord_obj.id,
                'order_number': ord_obj.order_number,
                'created_at': ord_obj.created_at.isoformat(),
                'status': ord_obj.status,
                'status_display': ord_obj.get_status_display(),
                'payment_status': ord_obj.payment_status,
                'payment_method': ord_obj.payment_method,
                'subtotal': float(ord_obj.subtotal),
                'discount_amount': float(ord_obj.discount_amount),
                'shipping_amount': float(ord_obj.shipping_amount),
                'total_amount': float(ord_obj.total_amount),
                'customer_name': ord_obj.customer_name,
                'customer_phone': ord_obj.customer_phone,
                'customer_email': ord_obj.customer_email,
                'shipping_address': ord_obj.shipping_address,
                'shipping_city': ord_obj.shipping_city,
                'shipping_state': ord_obj.shipping_state,
                'shipping_pincode': ord_obj.shipping_pincode,
                'items': items_data,
                'items_count': sum(i['quantity'] for i in items_data),
            })

        return Response({'orders': results, 'count': len(results)}, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    """
    GET /api/orders/summary/<order_number>/
    Returns full order summary details for an order reference number.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, order_number):
        ord_obj = Order.objects.filter(order_number__iexact=order_number).first()
        if not ord_obj:
            return Response({'error': f"Order '{order_number}' not found."}, status=status.HTTP_404_NOT_FOUND)

        items_data = []
        for item in ord_obj.items.all():
            img = ''
            if item.product and item.product.main_image:
                img = item.product.main_image
            elif item.product and hasattr(item.product, 'side_images') and item.product.side_images.exists():
                img = item.product.side_images.first().image_url

            items_data.append({
                'id': item.id,
                'product_id': item.product_id,
                'product_name': item.product_name,
                'product_sku': item.product_sku,
                'unit_price': float(item.unit_price),
                'quantity': item.quantity,
                'total_price': float(item.total_price),
                'image': img,
            })

        return Response({
            'order': {
                'id': ord_obj.id,
                'order_number': ord_obj.order_number,
                'created_at': ord_obj.created_at.isoformat(),
                'status': ord_obj.status,
                'status_display': ord_obj.get_status_display(),
                'payment_status': ord_obj.payment_status,
                'payment_method': ord_obj.payment_method,
                'subtotal': float(ord_obj.subtotal),
                'discount_amount': float(ord_obj.discount_amount),
                'shipping_amount': float(ord_obj.shipping_amount),
                'total_amount': float(ord_obj.total_amount),
                'customer_name': ord_obj.customer_name,
                'customer_phone': ord_obj.customer_phone,
                'customer_email': ord_obj.customer_email,
                'shipping_address': ord_obj.shipping_address,
                'shipping_city': ord_obj.shipping_city,
                'shipping_state': ord_obj.shipping_state,
                'shipping_pincode': ord_obj.shipping_pincode,
                'items': items_data,
                'items_count': sum(i['quantity'] for i in items_data),
            }
        }, status=status.HTTP_200_OK)
