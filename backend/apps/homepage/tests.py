from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.store_settings.models import StoreSettings
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.promotions.models import HomepageBanner, Promotion

class HomepageAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Store settings
        self.store = StoreSettings.objects.create(
            store_name="Maison Royale",
            contact_email="concierge@maisonroyale.com",
            contact_phone="+91 98765 43210",
            currency="INR",
            currency_symbol="₹",
            is_active=True
        )

        # Category
        self.category = Category.objects.create(
            name="Diamond Rings",
            slug="diamond-rings",
            is_active=True,
            display_order=1
        )

        # Products
        self.product = Product.objects.create(
            name="Solitaire Diamond Ring",
            slug="solitaire-diamond-ring",
            sku="RNG-001",
            category=self.category,
            price=150000.00,
            sale_price=135000.00,
            stock_quantity=5,
            is_featured=True,
            is_new_arrival=True,
            is_active=True
        )

        # Product Image
        self.image = ProductImage.objects.create(
            product=self.product,
            image_url="https://ik.imagekit.io/demo/solitaire.jpg",
            imagekit_file_id="img_123",
            alt_text="Solitaire Diamond Ring Front View",
            is_primary=True,
            display_order=1
        )

        # Banner
        self.banner = HomepageBanner.objects.create(
            title="Royal Solitaire Collection",
            desktop_image_url="https://ik.imagekit.io/demo/hero.jpg",
            button_text="Discover High Jewellery",
            button_link="/collections",
            is_active=True,
            display_order=1
        )

    def test_homepage_endpoint(self):
        url = reverse('homepage-data')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = response.data
        self.assertIn('store', data)
        self.assertIn('banners', data)
        self.assertIn('categories', data)
        self.assertIn('featured_products', data)
        self.assertIn('new_arrivals', data)
        self.assertIn('promotions', data)

        # Check values
        self.assertEqual(data['store']['store_name'], "Maison Royale")
        self.assertEqual(len(data['banners']), 1)
        self.assertEqual(data['banners'][0]['title'], "Royal Solitaire Collection")
        self.assertEqual(len(data['categories']), 1)
        self.assertEqual(data['categories'][0]['name'], "Diamond Rings")
        self.assertEqual(len(data['featured_products']), 1)
        self.assertEqual(data['featured_products'][0]['name'], "Solitaire Diamond Ring")
        self.assertEqual(data['featured_products'][0]['primary_image']['image_url'], "https://ik.imagekit.io/demo/solitaire.jpg")
        self.assertEqual(len(data['new_arrivals']), 1)

    def test_categories_endpoint(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], "diamond-rings")

    def test_products_endpoint(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)

    def test_product_detail_endpoint(self):
        url = reverse('product-detail', kwargs={'slug': 'solitaire-diamond-ring'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['sku'], "RNG-001")
        self.assertEqual(len(response.data['images']), 1)
