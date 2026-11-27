from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.categories.models import Category
from apps.products.models import Product, ProductSideImage
from apps.promotions.models import Promotion
from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from apps.orders.views import (
    calculate_product_checkout,
    calculate_cart_checkout,
    get_product_summary_data,
)

class CheckoutAndOrdersTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat1 = Category.objects.create(name="Temple Jewellery")
        self.cat2 = Category.objects.create(name="Dance Accessories")

        self.prod1 = Product.objects.create(
            name="Lakshmi Kasu Mala",
            category=self.cat1,
            price=15000.00,
            dimensions="55g, Traditional Temple Antique, SKU: NG-LKM-001",
            main_image="https://example.com/kasu-mala.jpg",
            description="Pure handcrafted traditional Lakshmi Kasu Mala.",
        )

        self.prod2 = Product.objects.create(
            name="Classic Salangai 4 Line",
            category=self.cat2,
            price=2500.00,
            dimensions="120g, Brass Bells on Leather, SKU: NG-SLG-002",
            main_image="https://example.com/salangai.jpg",
            description="Professional 4-line brass bells salangai.",
        )

        # Promotion on prod1 (10% off)
        self.promo = Promotion.objects.create(
            title="Temple Festive Offer",
            product=self.prod1,
            discount_type="PERCENTAGE",
            discount_value=Decimal("10.00"),
            is_active=True,
        )

    def test_get_product_summary_data(self):
        """Verify that get_product_summary_data extracts all required fields."""
        summary = get_product_summary_data(self.prod1)
        self.assertEqual(summary['id'], self.prod1.id)
        self.assertEqual(summary['name'], "Lakshmi Kasu Mala")
        self.assertEqual(summary['category'], "Temple Jewellery")
        self.assertEqual(summary['weight'], "55g")
        self.assertIn("NG-LKM-001", summary['sku'])
        self.assertEqual(summary['price'], 15000.0)
        self.assertEqual(summary['main_image'], "https://example.com/kasu-mala.jpg")

    def test_calculate_single_product_checkout_with_promotion(self):
        """Verify single product checkout calculation and promotion discounts."""
        calc = calculate_product_checkout(self.prod1, quantity=2)
        self.assertEqual(calc['quantity'], 2)
        self.assertEqual(calc['unit_price'], 15000.0)
        # 10% of 15000 = 1500 discount per unit
        self.assertEqual(calc['discount_per_unit'], 1500.0)
        self.assertEqual(calc['discounted_unit_price'], 13500.0)
        self.assertEqual(calc['original_total'], 30000.0)
        self.assertEqual(calc['total_savings'], 3000.0)
        self.assertEqual(calc['final_total'], 27000.0)
        self.assertEqual(calc['delivery_charge'], 0.0)
        self.assertEqual(calc['product']['category'], "Temple Jewellery")
        self.assertEqual(calc['product']['weight'], "55g")

    def test_calculate_cart_checkout_multi_item(self):
        """Verify cart checkout calculations for multiple items."""
        items = [
            {'product_id': self.prod1.id, 'quantity': 1},
            {'product_id': self.prod2.id, 'quantity': 2},
        ]
        cart_calc = calculate_cart_checkout(items)
        self.assertEqual(cart_calc['items_count'], 2)
        self.assertEqual(cart_calc['total_quantity'], 3)
        # prod1: 15000 - 1500 = 13500
        # prod2: 2 * 2500 = 5000
        # gross subtotal: 15000 + 5000 = 20000
        # promo savings: 1500
        # final: 18500
        self.assertEqual(cart_calc['subtotal'], 20000.0)
        self.assertEqual(cart_calc['other_discounts'], 1500.0)
        self.assertEqual(cart_calc['final_total'], 18500.0)
        self.assertEqual(cart_calc['delivery_charge'], 0.0)

    def test_coupon_application_welcome10(self):
        """Verify coupon code discount calculations."""
        items = [
            {'product_id': self.prod2.id, 'quantity': 2}, # 5000 subtotal, no promo
        ]
        res = calculate_cart_checkout(items, coupon_code="NATYAM10")
        self.assertTrue(res['coupon_valid'])
        # 10% of 5000 = 500
        self.assertEqual(res['coupon_discount'], 500.0)
        self.assertEqual(res['final_total'], 4500.0)

    def test_checkout_calculate_api_endpoint(self):
        """Test POST /api/orders/calculate/ with cart items."""
        payload = {
            'items': [
                {'product_id': self.prod1.id, 'quantity': 1},
                {'product_id': self.prod2.id, 'quantity': 1},
            ],
            'coupon_code': 'NATYAM10'
        }
        response = self.client.post('/api/orders/calculate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertEqual(len(response.data['items']), 2)
        self.assertIn('final_total', response.data)
        self.assertTrue(response.data['coupon_valid'])

    def test_create_order_cart_checkout(self):
        """Test POST /api/orders/create/ with cart items and address."""
        payload = {
            'items': [
                {'product_id': self.prod1.id, 'quantity': 1},
                {'product_id': self.prod2.id, 'quantity': 1},
            ],
            'address': {
                'full_name': 'Devi Meenakshi',
                'phone': '9876543210',
                'pincode': '600028',
                'house_building': 'Flat 2A, Temple View',
                'street_area': 'Mada Street, Mylapore',
                'landmark': 'Near Kapaleeshwarar Temple',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'address_type': 'Home'
            },
            'coupon_code': 'NATYAM10'
        }
        response = self.client.post('/api/orders/create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', response.data)
        self.assertTrue(response.data['order_number'].startswith('RBN-'))

        # Verify order in DB
        order = Order.objects.get(order_number=response.data['order_number'])
        self.assertEqual(order.customer_name, 'Devi Meenakshi')
        self.assertEqual(order.items.count(), 2)
        self.assertEqual(order.coupon_code, 'NATYAM10')
        self.assertEqual(order.status, OrderStatus.CONFIRMED)
