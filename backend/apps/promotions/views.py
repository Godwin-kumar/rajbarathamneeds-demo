from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q
from .models import HomepageBanner, Promotion
from .serializers import HomepageBannerSerializer, PromotionSerializer

class ActiveBannerListView(generics.ListAPIView):
    """
    GET /api/promotions/banners/
    Returns active homepage banners within valid schedule.
    """
    serializer_class = HomepageBannerSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        now = timezone.now()
        return HomepageBanner.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now),
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        ).order_by('display_order', '-created_at')


class ActivePromotionListView(generics.ListAPIView):
    """
    GET /api/promotions/
    Returns active promotions with associated product information.
    """
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Promotion.objects.filter(
            is_active=True
        ).select_related('product').order_by('-id')


class PromotionDetailView(generics.RetrieveAPIView):
    """
    GET /api/promotions/{id}/
    Returns details for a single promotion.
    Supports lookup by integer ID or string title.
    """
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = str(self.kwargs.get('pk', '')).strip()
        qs = Promotion.objects.filter(is_active=True).select_related('product')
        if lookup.isdigit():
            obj = qs.filter(id=int(lookup)).first()
            if obj:
                return obj
        obj = qs.filter(title__iexact=lookup).first()
        if obj:
            return obj
        from django.http import Http404
        raise Http404(f"Promotion '{lookup}' not found")
