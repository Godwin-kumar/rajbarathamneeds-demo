from django.test import TestCase
from rest_framework.test import APIClient
from apps.categories.models import Category
from apps.products.models import Product, ProductSideImage
from apps.products.serializers import ProductListSerializer, ProductDetailSerializer

class ProductSerializerAndAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Temple Necklaces")
        self.product = Product.objects.create(
            name="Kemp Stone Temple Choker",
            category=self.category,
            price=12500.00,
            dimensions="45g, 22K Gold Plated, SKU: NG-NCK-101",
            main_image="https://example.com/images/kemp-choker.jpg",
            description="Traditional handcrafted temple choker for Bharatanatyam dancers.",
        )
        self.side_img = ProductSideImage.objects.create(
            product=self.product,
            image_url="https://example.com/images/kemp-choker-side.jpg",
            display_order=1,
        )

    def test_product_list_serializer_includes_all_metadata(self):
        """Verify that serializer outputs category, category_name, sku, weight, and images."""
        serializer = ProductListSerializer(self.product)
        data = serializer.data

        self.assertEqual(data['id'], self.product.id)
        self.assertEqual(data['name'], "Kemp Stone Temple Choker")
        self.assertEqual(float(data['price']), 12500.00)
        self.assertEqual(data['category_name'], "Temple Necklaces")
        self.assertIsNotNone(data['category'])
        self.assertEqual(data['category']['name'], "Temple Necklaces")
        self.assertEqual(data['sku'], "45g, 22K Gold Plated, SKU: NG-NCK-101")
        self.assertEqual(data['weight'], "45g")
        self.assertEqual(data['main_image'], "https://example.com/images/kemp-choker.jpg")
        self.assertEqual(len(data['side_images']), 1)

    def test_product_detail_serializer_includes_all_metadata(self):
        """Verify that detail serializer provides full product details."""
        serializer = ProductDetailSerializer(self.product)
        data = serializer.data

        self.assertEqual(data['name'], "Kemp Stone Temple Choker")
        self.assertEqual(data['category_name'], "Temple Necklaces")
        self.assertEqual(data['weight'], "45g")
