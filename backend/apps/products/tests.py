from django.test import TestCase
from django.contrib import admin
from rest_framework.test import APIClient
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.products.admin import ProductImageInlineForm, ProductImageInline
from apps.products.serializers import ProductListSerializer, ProductDetailSerializer

class ProductAdminAndAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.product = Product.objects.create(
            name="Emerald Diamond Pendant",
            slug="emerald-diamond-pendant",
            sku="NCK-001",
            category=self.category,
            price=75000.00,
            is_active=True,
            is_featured=True,
        )

    def test_image_url_removed_from_admin_form_fields(self):
        """Verify that manual IMAGE URL input is completely removed from the form."""
        form_fields = list(ProductImageInlineForm.base_fields.keys())
        self.assertNotIn('image_url', form_fields)
        self.assertNotIn('imagekit_file_id', form_fields)
        self.assertIn('upload_file', form_fields)
        self.assertIn('alt_text', form_fields)
        self.assertIn('display_order', form_fields)
        self.assertIn('is_primary', form_fields)

    def test_inline_fields_configuration(self):
        """Verify inline displays upload_file, preview, alt_text, display_order, is_primary."""
        inline = ProductImageInline(Product, admin.site)
        self.assertEqual(inline.fields, ('upload_file', 'preview', 'alt_text', 'display_order', 'is_primary'))
        self.assertEqual(inline.readonly_fields, ('preview',))
        self.assertTrue(inline.can_delete)

    def test_automatic_image_url_population_and_api_serialization(self):
        """Verify image_url is populated and API returns correct primary_image and images."""
        img = ProductImage.objects.create(
            product=self.product,
            image_url="https://ik.imagekit.io/s7kex227s/jewellery/products/NCK-001/emerald.jpg",
            imagekit_file_id="file_em_123",
            alt_text="Emerald Pendant Front",
            is_primary=True,
            display_order=1
        )

        serializer = ProductListSerializer(self.product)
        data = serializer.data

        self.assertIsNotNone(data['primary_image'])
        self.assertEqual(data['primary_image']['image_url'], "https://ik.imagekit.io/s7kex227s/jewellery/products/NCK-001/emerald.jpg")
        self.assertEqual(len(data['images']), 1)
        self.assertEqual(data['images'][0]['alt_text'], "Emerald Pendant Front")

        detail_serializer = ProductDetailSerializer(self.product)
        detail_data = detail_serializer.data
        self.assertEqual(detail_data['primary_image']['image_url'], "https://ik.imagekit.io/s7kex227s/jewellery/products/NCK-001/emerald.jpg")
