"""
ImageKit Connection Diagnostic Tool
Tests ImageKit credentials, authentication, and image transformations.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

def test_imagekit():
    print("=" * 60)
    print("IMAGEKIT INTEGRATION TEST")
    print("=" * 60)

    try:
        import django
        django.setup()
        from services.imagekit_service import imagekit_service
    except Exception as e:
        print(f"[ERROR] Failed to load Django environment: {e}")
        return False

    pub_key = os.getenv('IMAGEKIT_PUBLIC_KEY', '')
    priv_key = os.getenv('IMAGEKIT_PRIVATE_KEY', '')
    endpoint = os.getenv('IMAGEKIT_URL_ENDPOINT', '')

    print(f"Public Key:   {'Configured' if pub_key and 'your_' not in pub_key else 'Missing / Placeholder'}")
    print(f"Private Key:  {'Configured (Hidden)' if priv_key and 'your_' not in priv_key else 'Missing / Placeholder'}")
    print(f"URL Endpoint: {endpoint if endpoint and 'your_' not in endpoint else 'Missing / Placeholder'}")

    if not imagekit_service.is_configured:
        print("\n[STATUS: AWAITING CREDENTIALS]")
        print("ImageKit credentials are not yet set in backend/.env.")
        print("Please configure:")
        print("IMAGEKIT_PUBLIC_KEY=your_public_key")
        print("IMAGEKIT_PRIVATE_KEY=your_private_key")
        print("IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id\n")
        return False

    print("\n[SUCCESS] ImageKit configuration detected!")
    test_url = imagekit_service.get_product_card_url(f"{endpoint}/sample.jpg")
    print(f"Sample transformed product card URL: {test_url}")
    return True

if __name__ == '__main__':
    success = test_imagekit()
    sys.exit(0 if success else 1)
