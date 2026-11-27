"""
ImageKit Service
Handles secure image upload, deletion, and responsive URL transformations
for the Luxury Jewellery E-Commerce platform.
"""
import os
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from django.conf import settings

logger = logging.getLogger(__name__)

class ImageKitService:
    def __init__(self):
        self.private_key = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', '') or os.getenv('IMAGEKIT_PRIVATE_KEY', '')
        self.public_key = getattr(settings, 'IMAGEKIT_PUBLIC_KEY', '') or os.getenv('IMAGEKIT_PUBLIC_KEY', '')
        self.url_endpoint = getattr(settings, 'IMAGEKIT_URL_ENDPOINT', '') or os.getenv('IMAGEKIT_URL_ENDPOINT', '')
        self._client = None

    @property
    def is_configured(self):
        return bool(self.private_key and self.url_endpoint and 'your_' not in self.private_key)

    def _get_client(self):
        if not self.is_configured:
            raise ValueError(
                "ImageKit is not fully configured. Please set IMAGEKIT_PRIVATE_KEY, "
                "IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_URL_ENDPOINT in your environment."
            )
        if self._client is None:
            try:
                from imagekitio import ImageKit
                self._client = ImageKit(private_key=self.private_key)
            except Exception as e:
                logger.error(f"Failed to initialize ImageKit client: {e}")
                raise
        return self._client

    def upload_image(self, file_obj, file_name, folder="/jewellery/products/"):
        """
        Uploads an image file object to ImageKit.
        Returns a dict: { 'file_id': ..., 'url': ..., 'name': ..., 'thumbnail_url': ... }
        """
        if not self.is_configured:
            logger.warning("ImageKit credentials not set. Simulating upload path for development.")
            return {
                'file_id': f'placeholder_{file_name}',
                'url': f'{self.url_endpoint.rstrip("/")}/{folder.strip("/")}/{file_name}' if self.url_endpoint else f'/media/{file_name}',
                'name': file_name,
                'width': 1000,
                'height': 1000,
            }

        client = self._get_client()

        # Handle in-memory uploaded files or bytes
        if hasattr(file_obj, 'read'):
            file_data = file_obj.read()
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)
        else:
            file_data = file_obj

        try:
            response = client.files.upload(
                file=file_data,
                file_name=file_name,
                folder=folder,
                use_unique_file_name=True,
            )

            file_id = getattr(response, 'file_id', None) or (response.get('fileId') if isinstance(response, dict) else None)
            url = getattr(response, 'url', None) or (response.get('url') if isinstance(response, dict) else None)
            name = getattr(response, 'name', None) or (response.get('name') if isinstance(response, dict) else None)
            width = getattr(response, 'width', 0) or (response.get('width', 0) if isinstance(response, dict) else 0)
            height = getattr(response, 'height', 0) or (response.get('height', 0) if isinstance(response, dict) else 0)

            return {
                'file_id': file_id,
                'url': url,
                'name': name,
                'width': width,
                'height': height,
            }
        except Exception as e:
            logger.warning(f"ImageKit cloud upload failed for {file_name}: {e}. Falling back to local media storage.")
            return self._save_local_fallback(file_data, file_name, folder)

    def _save_local_fallback(self, file_data, file_name, folder="/jewellery/products/"):
        """
        Saves file directly to Django MEDIA_ROOT as a safe fallback when cloud CDN is unreachable.
        """
        try:
            import uuid
            rel_folder = folder.strip("/\\")
            target_dir = os.path.join(settings.MEDIA_ROOT, rel_folder)
            os.makedirs(target_dir, exist_ok=True)
            clean_name = os.path.basename(file_name).replace(' ', '_')
            safe_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"
            target_path = os.path.join(target_dir, safe_name)
            
            with open(target_path, 'wb') as dest:
                if isinstance(file_data, bytes):
                    dest.write(file_data)
                elif hasattr(file_data, 'read'):
                    dest.write(file_data.read())
                else:
                    dest.write(str(file_data).encode('utf-8'))

            media_url = f"{settings.MEDIA_URL.rstrip('/')}/{rel_folder}/{safe_name}"
            logger.info(f"Saved file to local media storage: {media_url}")
            return {
                'file_id': f'local_{safe_name}',
                'url': media_url,
                'name': safe_name,
                'width': 1000,
                'height': 1000,
            }
        except Exception as local_err:
            logger.error(f"Local media storage fallback failed for {file_name}: {local_err}", exc_info=True)
            raise

    def delete_image(self, file_id):
        """
        Deletes an image from ImageKit by file ID.
        """
        if not file_id or not self.is_configured:
            return True

        client = self._get_client()
        try:
            client.files.delete(file_id=file_id)
            logger.info(f"Successfully deleted ImageKit file: {file_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete ImageKit file {file_id}: {e}")
            return False

    def get_transformed_url(self, base_url, width=None, height=None, quality=85, crop="maintain_ratio", format="auto"):
        """
        Generates responsive, optimized ImageKit CDN URL with transformations.
        Preserves stone facets, precious metal luster, and ornament clarity.
        """
        if not base_url:
            return ""

        # Build ImageKit transformation query string: tr=w-600,h-600,q-85,f-auto
        params = []
        if width:
            params.append(f"w-{width}")
        if height:
            params.append(f"h-{height}")
        if quality:
            params.append(f"q-{quality}")
        if format:
            params.append(f"f-{format}")
        if crop:
            params.append(f"c-{crop}")

        if not params:
            return base_url

        tr_string = ",".join(params)

        # Append transformation as query param or path param
        parsed = urlparse(base_url)
        query = parse_qs(parsed.query)
        query['tr'] = [tr_string]
        new_query = urlencode(query, doseq=True)

        return urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))

    # Standard presets tailored for luxury jewellery presentation
    def get_hero_url(self, base_url):
        return self.get_transformed_url(base_url, width=1600, quality=90, format="auto")

    def get_product_card_url(self, base_url):
        return self.get_transformed_url(base_url, width=600, height=600, quality=88, format="auto")

    def get_thumbnail_url(self, base_url):
        return self.get_transformed_url(base_url, width=300, height=300, quality=82, format="auto")

    def get_detail_url(self, base_url):
        return self.get_transformed_url(base_url, width=1200, height=1200, quality=92, format="auto")

imagekit_service = ImageKitService()
