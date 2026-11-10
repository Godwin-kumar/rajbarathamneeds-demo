"""
Neon PostgreSQL Connection Diagnostic Tool
Tests connection to the Neon Cloud PostgreSQL database using Django and psycopg.
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

def test_connection():
    print("=" * 60)
    print("NEON POSTGRESQL CONNECTION TEST")
    print("=" * 60)

    try:
        import django
        django.setup()
        from django.conf import settings
        from django.db import connection
    except Exception as e:
        print(f"[ERROR] Failed to load Django environment: {e}")
        return False

    db_url = os.getenv('DATABASE_URL')
    if not db_url or 'user:password' in db_url or 'your_' in db_url:
        print("[STATUS: AWAITING CREDENTIALS]")
        print("DATABASE_URL is not configured with your actual Neon PostgreSQL connection string.")
        print("\nPlease update backend/.env with your Neon credentials:")
        print("DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require\n")
        return False

    print(f"Connecting to database endpoint: {db_url.split('@')[-1].split('/')[0] if '@' in db_url else 'configured host'}...")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            row = cursor.fetchone()
            print("\n[SUCCESS] Neon PostgreSQL connection verified successfully!")
            print(f"PostgreSQL Version: {row[0]}")
            return True
    except Exception as e:
        print(f"\n[ERROR] Connection to Neon PostgreSQL failed:")
        print(f"{type(e).__name__}: {e}")
        print("\nTroubleshooting tips for Neon:")
        print("1. Ensure ?sslmode=require is present in the connection string.")
        print("2. Verify that your Neon project compute endpoint is active.")
        print("3. Check user password and network whitelist permissions.")
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
