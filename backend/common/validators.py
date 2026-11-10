import os
from django.core.exceptions import ValidationError
from PIL import Image

def validate_image_file(file):
    """
    Validate uploaded image size and format for luxury jewellery presentation.
    Limit: 10MB max, valid image formats only.
    """
    max_size_mb = 10
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Maximum image upload size is {max_size_mb}MB.")

    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported image format: {ext}. Allowed: {', '.join(valid_extensions)}")

    try:
        image = Image.open(file)
        image.verify()
    except Exception:
        raise ValidationError("Uploaded file is not a valid or readable image.")

def validate_positive_price(value):
    if value is not None and value < 0:
        raise ValidationError("Price must be a positive decimal value.")

def validate_stock_quantity(value):
    if value is not None and value < 0:
        raise ValidationError("Stock quantity cannot be negative.")
