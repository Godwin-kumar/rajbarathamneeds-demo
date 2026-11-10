from rest_framework import serializers
from .models import StoreSettings

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = [
            'id',
            'store_name',
            'logo_url',
            'favicon_url',
            'contact_email',
            'contact_phone',
            'address',
            'currency',
            'currency_symbol',
            'is_active',
        ]
