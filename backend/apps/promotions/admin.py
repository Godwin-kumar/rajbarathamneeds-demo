
from django.contrib import admin
from .models import HomepageBanner, Promotion


@admin.register(HomepageBanner)
class HomepageBannerAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'is_active',
        'display_order',
        'start_date',
        'end_date',
    )

    list_filter = ('is_active',)
    search_fields = ('title',)
    ordering = ('display_order', '-created_at')


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'product',
        'discount_type',
        'discount_value',
        'is_active',
    )

    list_filter = (
        'discount_type',
        'is_active',
    )

    search_fields = (
        'title',
        'product__name',
    )

    list_editable = ('is_active',)
