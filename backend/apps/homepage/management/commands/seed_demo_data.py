from django.core.management.base import BaseCommand
from apps.store_settings.models import StoreSettings
from apps.categories.models import Category
from apps.products.models import Product, ProductImage, FeaturedProduct
from apps.promotions.models import HomepageBanner, Promotion

class Command(BaseCommand):
    help = "Populate initial luxury jewellery sample categories, products, and banners into Neon PostgreSQL."

    def handle(self, *args, **options):
        self.stdout.write("Seeding sample catalogue into database...")

        # Store Settings
        store, _ = StoreSettings.objects.get_or_create(
            store_name="Maison de Luxe",
            defaults={
                'contact_email': "concierge@maisondeluxe.com",
                'contact_phone': "+91 98765 43210",
                'address': "12 Place Vendôme, Luxury Quarter",
                'currency': "INR",
                'currency_symbol': "₹",
                'is_active': True,
            }
        )

        # Categories
        cat_rings, _ = Category.objects.get_or_create(
            slug="rings",
            defaults={'name': "Solitaire & Diamond Rings", 'display_order': 1, 'is_active': True}
        )
        cat_necklaces, _ = Category.objects.get_or_create(
            slug="necklaces",
            defaults={'name': "Haute Joaillerie Necklaces", 'display_order': 2, 'is_active': True}
        )
        cat_earrings, _ = Category.objects.get_or_create(
            slug="earrings",
            defaults={'name': "Diamond & Gemstone Earrings", 'display_order': 3, 'is_active': True}
        )
        cat_bracelets, _ = Category.objects.get_or_create(
            slug="bracelets",
            defaults={'name': "Fine Bangles & Bracelets", 'display_order': 4, 'is_active': True}
        )

        # Products
        p1, _ = Product.objects.get_or_create(
            sku="RNG-SOL-001",
            defaults={
                'name': "Eternal Solitaire Diamond Ring",
                'slug': "eternal-solitaire-diamond-ring",
                'category': cat_rings,
                'short_description': "A hand-faceted 2.5 carat brilliant-cut diamond set in platinum.",
                'description': "Exquisitely hand-crafted by master Parisian artisans.",
                'price': 345000.00,
                'sale_price': 320000.00,
                'stock_quantity': 3,
                'is_featured': True,
                'is_new_arrival': True,
                'is_active': True,
            }
        )
        ProductImage.objects.get_or_create(
            product=p1,
            image_url="https://ik.imagekit.io/demo/img/ring_sample.jpg",
            defaults={'alt_text': "Eternal Solitaire Diamond Ring", 'is_primary': True, 'display_order': 1}
        )
        FeaturedProduct.objects.get_or_create(product=p1, defaults={'display_order': 1, 'is_active': True})

        p2, _ = Product.objects.get_or_create(
            sku="NCK-ROY-002",
            defaults={
                'name': "Royal Cascading Diamond Necklace",
                'slug': "royal-cascading-diamond-necklace",
                'category': cat_necklaces,
                'short_description': "Cascading tiers of pavé-set diamonds in 18k white gold.",
                'description': "An iconic statement creation for gala events and private celebrations.",
                'price': 890000.00,
                'sale_price': None,
                'stock_quantity': 2,
                'is_featured': True,
                'is_new_arrival': False,
                'is_active': True,
            }
        )
        ProductImage.objects.get_or_create(
            product=p2,
            image_url="https://ik.imagekit.io/demo/img/necklace_sample.jpg",
            defaults={'alt_text': "Royal Cascading Diamond Necklace", 'is_primary': True, 'display_order': 1}
        )
        FeaturedProduct.objects.get_or_create(product=p2, defaults={'display_order': 2, 'is_active': True})

        p3, _ = Product.objects.get_or_create(
            sku="EAR-SAP-003",
            defaults={
                'name': "Sapphire & Diamond Drop Earrings",
                'slug': "sapphire-diamond-drop-earrings",
                'category': cat_earrings,
                'short_description': "Ceylon blue sapphires surrounded by diamond halos.",
                'description': "Luminous Ceylon sapphires paired with brilliant cut diamonds.",
                'price': 275000.00,
                'sale_price': 250000.00,
                'stock_quantity': 4,
                'is_featured': True,
                'is_new_arrival': True,
                'is_active': True,
            }
        )
        ProductImage.objects.get_or_create(
            product=p3,
            image_url="https://ik.imagekit.io/demo/img/earring_sample.jpg",
            defaults={'alt_text': "Sapphire & Diamond Drop Earrings", 'is_primary': True, 'display_order': 1}
        )

        p4, _ = Product.objects.get_or_create(
            sku="BRC-EMR-004",
            defaults={
                'name': "Colombian Emerald Art Deco Bracelet",
                'slug': "colombian-emerald-art-deco-bracelet",
                'category': cat_bracelets,
                'short_description': "Vibrant emerald-cut Colombian emeralds with baguette diamonds.",
                'description': "Geometric Art Deco silhouette celebrating timeless heritage aesthetics.",
                'price': 620000.00,
                'sale_price': None,
                'stock_quantity': 1,
                'is_featured': True,
                'is_new_arrival': True,
                'is_active': True,
            }
        )
        ProductImage.objects.get_or_create(
            product=p4,
            image_url="https://ik.imagekit.io/demo/img/bracelet_sample.jpg",
            defaults={'alt_text': "Colombian Emerald Art Deco Bracelet", 'is_primary': True, 'display_order': 1}
        )

        # Banner
        HomepageBanner.objects.get_or_create(
            title="The High Jewellery Gala Collection",
            defaults={
                'subtitle': "Winter Solstice Masterpieces",
                'desktop_image_url': "https://ik.imagekit.io/demo/img/banner_hero.jpg",
                'button_text': "Explore Collection",
                'button_link': "/collections",
                'display_order': 1,
                'is_active': True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded catalogue records!"))
