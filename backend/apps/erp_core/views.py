
import csv
import logging
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Sum, Q, OuterRef, Subquery, Value, IntegerField
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token

from rest_framework import viewsets, generics, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication

logger = logging.getLogger(__name__)

from .models import EmployeeProfile, EmployeeRole, AuditLog
from .permissions import IsERPAuthenticated, IsSuperAdmin, IsAdminOrHigher

from .serializers import (
    EmployeeUserSerializer,
    AuditLogSerializer,
    ERPProductSerializer,
    ProductSideImageDetailSerializer,
    ERPCategorySerializer,
    ERPPromotionSerializer,
    ERPCustomerSerializer,
    ERPOrderSerializer,
    OrderStatusHistorySerializer,
    InventoryMovementSerializer,
    ERPSupplierSerializer,
    ERPPurchaseOrderSerializer,
    ERPFinanceTransactionSerializer,
    ERPShipmentSerializer,
)

from apps.categories.models import Category
from apps.products.models import Product, ProductSideImage
from apps.promotions.models import Promotion
from apps.customers.models import Customer
from apps.orders.models import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
    OrderStatusHistory,
)
from apps.inventory.models import InventoryMovement, MovementType
from apps.purchases.models import (
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderStatus,
)
from apps.finance.models import (
    FinanceTransaction,
    TransactionType,
    TransactionCategory,
)
from apps.shipping.models import Shipment, ShippingStatus


# --------------------------------------------------------------------------
# COMMON HELPERS
# --------------------------------------------------------------------------

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def record_audit(
    user,
    action_name,
    module,
    description,
    affected_model=None,
    affected_id=None,
    request=None,
    changes=None,
):
    try:
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action_name,
            module=module,
            description=description,
            ip_address=get_client_ip(request) if request else None,
            affected_model=affected_model,
            affected_object_id=str(affected_id) if affected_id else None,
            changes_json=changes or {},
        )
    except Exception as e:
        logger.warning(f"Failed to record audit log: {e}")


def products_with_stock():
    """
    Returns products with current_stock calculated from their latest
    InventoryMovement record.

    Product itself does not contain a stock_quantity field.
    """
    latest_movement = (
        InventoryMovement.objects
        .filter(product_id=OuterRef('pk'))
        .order_by('-created_at', '-pk')
    )

    return Product.objects.annotate(
        current_stock=Coalesce(
            Subquery(latest_movement.values('new_stock')[:1]),
            Value(0),
            output_field=IntegerField(),
        )
    )


def get_current_stock(product):
    """
    Current stock is the new_stock value of the latest movement.
    Products without movement history start at zero.
    """
    latest = (
        InventoryMovement.objects
        .filter(product=product)
        .order_by('-created_at', '-pk')
        .values_list('new_stock', flat=True)
        .first()
    )
    return latest if latest is not None else 0


def create_stock_movement(
    product_id,
    movement_type,
    quantity_delta,
    reference_number='',
    reason='',
    user=None,
):
    """
    Create a stock movement safely.

    Must be called inside transaction.atomic().
    quantity_delta is signed:
      positive = stock increases
      negative = stock decreases
    """
    product = Product.objects.select_for_update().get(pk=product_id)

    previous_stock = get_current_stock(product)
    new_stock = previous_stock + quantity_delta

    if new_stock < 0:
        raise ValueError(
            f"Insufficient stock for {product.name}. "
            f"Available: {previous_stock}, requested reduction: {abs(quantity_delta)}."
        )

    movement = InventoryMovement.objects.create(
        product=product,
        movement_type=movement_type,
        quantity=quantity_delta,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reference_number=reference_number or None,
        reason=reason,
        adjusted_by=user,
    )

    return product, movement, previous_stock, new_stock


# --------------------------------------------------------------------------
# 1. AUTHENTICATION VIEWS
# --------------------------------------------------------------------------

class ERPLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = str(username).strip()

        user = None

        if '@' in username:
            matched_user = User.objects.filter(
                email__iexact=username
            ).first()

            if matched_user:
                user = authenticate(
                    request,
                    username=matched_user.username,
                    password=password,
                )

        if not user:
            user = authenticate(
                request,
                username=username,
                password=password,
            )

        if not user:
            record_audit(
                None,
                'LOGIN_FAILED',
                'AUTH',
                f"Failed login attempt for '{username}'",
                request=request,
            )
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'error': 'This employee account has been deactivated.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile = getattr(user, 'employee_profile', None)

        if not profile:
            role = (
                EmployeeRole.SUPER_ADMIN
                if user.is_superuser
                else EmployeeRole.ADMIN
            )

            profile, _ = EmployeeProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'department': (
                        'Executive Management'
                        if user.is_superuser
                        else 'Operations'
                    ),
                    'is_active': True,
                    'module_permissions': {
                        'dashboard': True,
                        'products': True,
                        'categories': True,
                        'promotions': True,
                        'orders': True,
                        'customers': True,
                        'inventory': True,
                        'suppliers': True,
                        'purchases': True,
                        'sales': True,
                        'finance': True,
                        'shipping': True,
                        'reports': True,
                        'employees': bool(user.is_superuser),
                        'settings': bool(user.is_superuser),
                    },
                },
            )

        if not profile.is_active:
            return Response(
                {
                    'error': (
                        'Your ERP access has been suspended. '
                        'Please contact administrator.'
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)

        record_audit(
            user,
            'LOGIN_SUCCESS',
            'AUTH',
            f"Employee {user.username} logged into ERP",
            affected_model='User',
            affected_id=user.id,
            request=request,
        )

        return Response({
            'message': 'Login successful',
            'csrf_token': get_token(request),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                'role': profile.role,
                'department': profile.department,
                'is_superuser': user.is_superuser,
                'permissions': profile.module_permissions or {},
            },
        })


class ERPCurrentUserView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user

        if not (
            user
            and user.is_authenticated
            and user.is_active
        ):
            return Response(
                {
                    'authenticated': False,
                    'error': 'Not authenticated',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        profile = getattr(user, 'employee_profile', None)

        if not profile:
            role = (
                EmployeeRole.SUPER_ADMIN
                if user.is_superuser
                else EmployeeRole.ADMIN
            )

            try:
                profile, _ = EmployeeProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'role': role,
                        'department': (
                            'Executive Management'
                            if user.is_superuser
                            else 'Operations'
                        ),
                        'is_active': True,
                    },
                )
            except Exception as e:
                logger.warning(
                    f"Could not create employee profile: {e}"
                )

        return Response({
            'authenticated': True,
            'csrf_token': get_token(request),
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name() or user.username,
            'role': (
                profile.role
                if profile
                else (
                    'SUPER_ADMIN'
                    if user.is_superuser
                    else 'ADMIN'
                )
            ),
            'department': (
                profile.department
                if profile
                else 'Executive Management'
            ),
            'is_superuser': user.is_superuser,
            'permissions': (
                profile.module_permissions
                if profile
                else {}
            ),
        })


class UnsafeMethodsCsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


class ERPLogoutView(views.APIView):
    authentication_classes = [
        UnsafeMethodsCsrfExemptSessionAuthentication
    ]
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            record_audit(
                request.user,
                'LOGOUT',
                'AUTH',
                f"Employee {request.user.username} logged out",
                request=request,
            )

        logout(request)
        return Response({'message': 'Logged out successfully'})


# --------------------------------------------------------------------------
# 2. DASHBOARD
# --------------------------------------------------------------------------

class ERPDashboardStatsView(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        date_filter = request.query_params.get('filter', '30days')
        now = timezone.now()

        if date_filter == 'today':
            start_date = now.replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        elif date_filter == 'yesterday':
            yesterday = now - timedelta(days=1)
            start_date = yesterday.replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        elif date_filter == '7days':
            start_date = now - timedelta(days=7)
        elif date_filter == 'this_month':
            start_date = now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
        elif date_filter == 'last_month':
            first_this_month = now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            start_date = (
                first_this_month - timedelta(days=1)
            ).replace(day=1)
        else:
            start_date = now - timedelta(days=30)

        # Products
        product_qs = products_with_stock()

        total_products = Product.objects.count()

        # Product has no is_active field. Keep this response key
        # for compatibility with the existing dashboard.
        active_products = total_products

        low_stock_products = product_qs.filter(
            current_stock__lte=5
        ).count()

        total_categories = Category.objects.filter(
            is_active=True
        ).count()

        # Orders
        valid_orders_qs = Order.objects.filter(
            status__in=[
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
            ]
        )

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(
            status=OrderStatus.PENDING
        ).count()
        completed_orders = Order.objects.filter(
            status=OrderStatus.DELIVERED
        ).count()

        lifetime_revenue = (
            valid_orders_qs.aggregate(
                rev=Sum('total_amount')
            )['rev']
            or Decimal('0.00')
        )

        period_orders = valid_orders_qs.filter(
            created_at__gte=start_date
        )

        period_revenue = (
            period_orders.aggregate(
                rev=Sum('total_amount')
            )['rev']
            or Decimal('0.00')
        )

        period_orders_count = Order.objects.filter(
            created_at__gte=start_date
        ).count()

        # Customers
        total_customers = Customer.objects.count()

        # Recent orders
        recent_orders = ERPOrderSerializer(
            Order.objects.order_by('-created_at')[:6],
            many=True,
        ).data

        # Low stock list
        low_stock_items = []

        for product in product_qs.filter(
            current_stock__lte=5
        ).order_by('current_stock', 'name')[:6]:
            low_stock_items.append({
                'id': product.id,
                'name': product.name,
                'stock_quantity': product.current_stock,
                'price': float(product.price),
            })

        # Monthly revenue trend
        monthly_trend = []

        for i in range(5, -1, -1):
            m_date = now - timedelta(days=i * 30)

            m_start = m_date.replace(
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )

            if m_start.month == 12:
                m_end = m_start.replace(
                    year=m_start.year + 1,
                    month=1,
                )
            else:
                m_end = m_start.replace(
                    month=m_start.month + 1
                )

            m_rev = (
                valid_orders_qs.filter(
                    created_at__gte=m_start,
                    created_at__lt=m_end,
                ).aggregate(r=Sum('total_amount'))['r']
                or Decimal('0.00')
            )

            m_orders = Order.objects.filter(
                created_at__gte=m_start,
                created_at__lt=m_end,
            ).count()

            monthly_trend.append({
                'month': m_start.strftime('%b %Y'),
                'revenue': float(m_rev),
                'orders': m_orders,
            })

        # Inventory valuation
        inventory_valuation = Decimal('0.00')

        for product in product_qs.only(
            'id', 'price'
        ):
            inventory_valuation += (
                product.price * product.current_stock
            )

        return Response({
            'summary': {
                'total_products': total_products,
                'active_products': active_products,
                'low_stock_products': low_stock_products,
                'total_categories': total_categories,
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'completed_orders': completed_orders,
                'total_customers': total_customers,
                'total_revenue': float(lifetime_revenue),
                'period_revenue': float(period_revenue),
                'period_orders': period_orders_count,
                'inventory_valuation': float(
                    inventory_valuation
                ),
            },
            'recent_orders': recent_orders,
            'low_stock_items': low_stock_items,
            'monthly_trend': monthly_trend,
        })


# --------------------------------------------------------------------------
# 3. PRODUCTS
# --------------------------------------------------------------------------

class ERPProductViewSet(viewsets.ModelViewSet):
    serializer_class = ERPProductSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related(
            'side_images'
        ).order_by('-id')

        search = self.request.query_params.get('search')

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(dimensions__icontains=search)
                | Q(category__name__icontains=search)
            )

        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category_id=category_param)

        status_param = self.request.query_params.get('status')

        if status_param == 'low_stock':
            low_stock_ids = products_with_stock().filter(
                current_stock__lte=5
            ).values_list('id', flat=True)

            qs = qs.filter(id__in=low_stock_ids)

        return qs

    def perform_create(self, serializer):
        product = serializer.save()

        # Handle main image file upload if provided
        uploaded_main = (
            self.request.FILES.get('upload_main_image') or
            self.request.FILES.get('main_image_file') or
            self.request.FILES.get('main_image')
        )
        if uploaded_main:
            try:
                from services.imagekit_service import imagekit_service
                res = imagekit_service.upload_image(
                    file_obj=uploaded_main,
                    file_name=f"{product.name.replace(' ', '_')}_main_{uploaded_main.name}",
                    folder="/jewellery/products/"
                )
                if res.get('url'):
                    product.main_image = res.get('url')
                    product.save(update_fields=['main_image'])
            except Exception as e:
                logger.warning(f"Failed to upload main image for product {product.id}: {e}")

        # Handle side images uploaded in the same multipart submission
        side_files = (
            self.request.FILES.getlist('side_images') or
            self.request.FILES.getlist('side_image_files') or
            self.request.FILES.getlist('images')
        )
        if side_files:
            try:
                from services.imagekit_service import imagekit_service
                current_count = product.side_images.count()
                for idx, sfile in enumerate(side_files[:5]):
                    res = imagekit_service.upload_image(
                        file_obj=sfile,
                        file_name=f"{product.name.replace(' ', '_')}_side_{sfile.name}",
                        folder="/jewellery/products/"
                    )
                    if res.get('url'):
                        ProductSideImage.objects.create(
                            product=product,
                            image_url=res.get('url'),
                            display_order=current_count + idx + 1,
                        )
            except Exception as e:
                logger.warning(f"Failed to upload side images for product {product.id}: {e}")

        record_audit(
            self.request.user,
            'CREATE_PRODUCT',
            'PRODUCTS',
            f"Created product '{product.name}'",
            'Product',
            product.id,
            self.request,
        )

    def perform_update(self, serializer):
        product = serializer.save()

        # Handle main image replacement if uploaded
        uploaded_main = (
            self.request.FILES.get('upload_main_image') or
            self.request.FILES.get('main_image_file') or
            self.request.FILES.get('main_image')
        )
        if uploaded_main:
            try:
                from services.imagekit_service import imagekit_service
                res = imagekit_service.upload_image(
                    file_obj=uploaded_main,
                    file_name=f"{product.name.replace(' ', '_')}_main_{uploaded_main.name}",
                    folder="/jewellery/products/"
                )
                if res.get('url'):
                    product.main_image = res.get('url')
                    product.save(update_fields=['main_image'])
            except Exception as e:
                logger.warning(f"Failed to upload main image during update for product {product.id}: {e}")

        # Handle side images uploaded during edit
        side_files = (
            self.request.FILES.getlist('side_images') or
            self.request.FILES.getlist('side_image_files') or
            self.request.FILES.getlist('images')
        )
        if side_files:
            try:
                from services.imagekit_service import imagekit_service
                current_count = product.side_images.count()
                remaining_slots = max(0, 5 - current_count)
                for idx, sfile in enumerate(side_files[:remaining_slots]):
                    res = imagekit_service.upload_image(
                        file_obj=sfile,
                        file_name=f"{product.name.replace(' ', '_')}_side_{sfile.name}",
                        folder="/jewellery/products/"
                    )
                    if res.get('url'):
                        ProductSideImage.objects.create(
                            product=product,
                            image_url=res.get('url'),
                            display_order=current_count + idx + 1,
                        )
            except Exception as e:
                logger.warning(f"Failed to upload side images during update for product {product.id}: {e}")

        record_audit(
            self.request.user,
            'UPDATE_PRODUCT',
            'PRODUCTS',
            f"Updated product '{product.name}'",
            'Product',
            product.id,
            self.request,
        )

    def perform_destroy(self, instance):
        name = instance.name
        product_id = instance.id

        instance.delete()

        record_audit(
            self.request.user,
            'DELETE_PRODUCT',
            'PRODUCTS',
            f"Deleted product '{name}' (ID: {product_id})",
            'Product',
            product_id,
            self.request,
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='upload-images',
    )
    def upload_images(self, request, id=None):
        """
        Uploads and attaches side images to a product.
        Supports both multipart file uploads and image URL strings.
        """
        product = self.get_object()

        # 1. Check for multipart file uploads
        uploaded_files = (
            request.FILES.getlist('images') or
            request.FILES.getlist('side_images') or
            request.FILES.getlist('files') or
            ([request.FILES.get('file')] if request.FILES.get('file') else [])
        )

        image_urls = []
        if uploaded_files:
            try:
                from services.imagekit_service import imagekit_service
                for f in uploaded_files:
                    res = imagekit_service.upload_image(
                        file_obj=f,
                        file_name=f"{product.name.replace(' ', '_')}_side_{f.name}",
                        folder="/jewellery/products/"
                    )
                    if res.get('url'):
                        image_urls.append(res.get('url'))
            except Exception as exc:
                return Response(
                    {'error': f"Failed to upload side image: {exc}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # 2. Check for URL strings in payload
            raw_urls = request.data.get('image_urls')
            if not raw_urls:
                single_url = request.data.get('image_url')
                if single_url:
                    raw_urls = [single_url]

            if isinstance(raw_urls, list):
                image_urls = [u for u in raw_urls if isinstance(u, str) and u.strip()]

        if not image_urls:
            return Response(
                {
                    'error': (
                        'Please provide image files (multipart) or image_urls list.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_images = []

        with transaction.atomic():
            current_count = product.side_images.count()

            for index, image_url in enumerate(image_urls):
                side_image = ProductSideImage.objects.create(
                    product=product,
                    image_url=image_url.strip(),
                    display_order=current_count + index + 1,
                )
                created_images.append(side_image)

        record_audit(
            request.user,
            'UPLOAD_IMAGES',
            'PRODUCTS',
            f"Added {len(created_images)} side images for '{product.name}'",
            'Product',
            product.id,
            request,
        )

        return Response({
            'message': 'Product images uploaded successfully.',
            'images': ProductSideImageDetailSerializer(
                created_images,
                many=True,
            ).data,
        })

    @action(
        detail=True,
        methods=['delete'],
        url_path='delete-image/(?P<image_id>[^/.]+)',
    )
    def delete_image(self, request, id=None, image_id=None):
        product = self.get_object()

        image = product.side_images.filter(
            id=image_id
        ).first()

        if not image:
            return Response(
                {'error': 'Image not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        image.delete()

        record_audit(
            request.user,
            'DELETE_IMAGE',
            'PRODUCTS',
            f"Deleted side image #{image_id} from '{product.name}'",
            'Product',
            product.id,
            request,
        )

        return Response({
            'message': 'Product side image deleted successfully.'
        })


# --------------------------------------------------------------------------
# 4. CATEGORIES
# --------------------------------------------------------------------------

class ERPCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ERPCategorySerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Category.objects.all().order_by('name')

        search = self.request.query_params.get('search')

        if search:
            qs = qs.filter(name__icontains=search)

        return qs

    def perform_create(self, serializer):
        category = serializer.save()

        record_audit(
            self.request.user,
            'CREATE_CATEGORY',
            'CATEGORIES',
            f"Created category '{category.name}'",
            'Category',
            category.id,
            self.request,
        )

    def perform_update(self, serializer):
        category = serializer.save()

        record_audit(
            self.request.user,
            'UPDATE_CATEGORY',
            'CATEGORIES',
            f"Updated category '{category.name}'",
            'Category',
            category.id,
            self.request,
        )

    def perform_destroy(self, instance):
        name = instance.name
        category_id = instance.id

        instance.delete()

        record_audit(
            self.request.user,
            'DELETE_CATEGORY',
            'CATEGORIES',
            f"Deleted category '{name}'",
            'Category',
            category_id,
            self.request,
        )


# --------------------------------------------------------------------------
# 5. PROMOTIONS
# --------------------------------------------------------------------------

class ERPPromotionViewSet(viewsets.ModelViewSet):
    serializer_class = ERPPromotionSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Promotion.objects.all().select_related('product').order_by('-id')

    def perform_create(self, serializer):
        promo = serializer.save()

        record_audit(
            self.request.user,
            'CREATE_PROMOTION',
            'PROMOTIONS',
            f"Created promotion '{promo.title}'",
            'Promotion',
            promo.id,
            self.request,
        )

    def perform_update(self, serializer):
        promo = serializer.save()

        record_audit(
            self.request.user,
            'UPDATE_PROMOTION',
            'PROMOTIONS',
            f"Updated promotion '{promo.title}'",
            'Promotion',
            promo.id,
            self.request,
        )

    def perform_destroy(self, instance):
        title = instance.title
        promo_id = instance.id

        instance.delete()

        record_audit(
            self.request.user,
            'DELETE_PROMOTION',
            'PROMOTIONS',
            f"Deleted promotion '{title}'",
            'Promotion',
            promo_id,
            self.request,
        )


# --------------------------------------------------------------------------
# 6. ORDERS
# --------------------------------------------------------------------------

class ERPOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ERPOrderSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Order.objects.prefetch_related(
            'items',
            'status_history',
        ).order_by('-created_at')

        status_param = self.request.query_params.get('status')

        if status_param and status_param != 'ALL':
            qs = qs.filter(status=status_param)

        search = self.request.query_params.get('search')

        if search:
            qs = qs.filter(
                Q(order_number__icontains=search)
                | Q(customer_name__icontains=search)
                | Q(customer_phone__icontains=search)
                | Q(customer_email__icontains=search)
            )

        return qs

    @action(
        detail=True,
        methods=['post'],
        url_path='update-status',
    )
    def update_status(self, request, id=None):
        order = self.get_object()

        new_status = request.data.get('status')
        comment = request.data.get('comment', '')

        if new_status not in OrderStatus.values:
            return Response(
                {'error': f"Invalid status '{new_status}'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status

        if old_status == new_status:
            return Response({
                'message': 'Status unchanged',
                'order': ERPOrderSerializer(order).data,
            })

        with transaction.atomic():
            order.status = new_status

            if (
                new_status == OrderStatus.DELIVERED
                and order.payment_method == 'COD'
            ):
                order.payment_status = PaymentStatus.PAID

            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                from_status=old_status,
                to_status=new_status,
                changed_by=request.user,
                comment=comment,
            )

            # Restore stock only when a SALE movement exists.
            # This avoids adding stock for orders that never deducted it.
            if (
                new_status == OrderStatus.CANCELLED
                and old_status != OrderStatus.CANCELLED
            ):
                for item in order.items.select_related('product'):
                    if not item.product:
                        continue

                    sale_exists = InventoryMovement.objects.filter(
                        product=item.product,
                        movement_type=MovementType.SALE,
                        reference_number=order.order_number,
                    ).exists()

                    if sale_exists and item.quantity > 0:
                        create_stock_movement(
                            product_id=item.product_id,
                            movement_type=MovementType.RETURN,
                            quantity_delta=item.quantity,
                            reference_number=order.order_number,
                            reason=(
                                f"Order {order.order_number} cancelled: "
                                f"{comment}"
                            ),
                            user=request.user,
                        )

            record_audit(
                request.user,
                'ORDER_STATUS_CHANGE',
                'ORDERS',
                (
                    f"Order {order.order_number} transitioned "
                    f"{old_status} -> {new_status}"
                ),
                'Order',
                order.id,
                request,
            )

        return Response({
            'message': f"Order status updated to {new_status}",
            'order': ERPOrderSerializer(order).data,
        })


# --------------------------------------------------------------------------
# 7. CUSTOMERS
# --------------------------------------------------------------------------

class ERPCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ERPCustomerSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Customer.objects.prefetch_related(
            'orders'
        ).order_by('-created_at')

        search = self.request.query_params.get('search')

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
            )

        return qs


# --------------------------------------------------------------------------
# 8. INVENTORY
# --------------------------------------------------------------------------

class ERPInventoryViewSet(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        products = products_with_stock().order_by(
            'current_stock',
            'name',
        )

        search = request.query_params.get('search')

        if search:
            products = products.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
            )

        items = []

        for product in products.prefetch_related('side_images'):
            stock = product.current_stock

            items.append({
                'id': product.id,
                'name': product.name,
                'sku': None,
                'category_name': None,
                'stock_quantity': stock,
                'price': float(product.price),
                'total_valuation': float(
                    product.price * stock
                ),
                'is_low_stock': stock <= 5,
                'is_active': True,
                'primary_image': product.main_image,
            })

        return Response({'products': items})

    def post(self, request):
        """
        Stock adjustment.

        STOCK_IN: add the supplied quantity.
        STOCK_OUT: remove the supplied quantity.
        ADJUSTMENT: supplied quantity is the target stock level.
        """
        product_id = request.data.get('product_id')
        adjustment_type = request.data.get(
            'type',
            'ADJUSTMENT',
        )
        quantity = request.data.get('quantity')
        reason = request.data.get(
            'reason',
            'Manual Inventory Adjustment',
        )
        reference_no = request.data.get(
            'reference_number',
            '',
        )

        if not product_id or quantity is None:
            return Response(
                {'error': 'Product and quantity are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Quantity must be an integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 0:
            return Response(
                {'error': 'Quantity cannot be negative.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if adjustment_type not in [
            'STOCK_IN',
            'STOCK_OUT',
            'ADJUSTMENT',
        ]:
            return Response(
                {'error': 'Invalid inventory adjustment type.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not Product.objects.filter(id=product_id).exists():
            return Response(
                {'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            with transaction.atomic():
                product = Product.objects.select_for_update().get(
                    id=product_id
                )

                previous_stock = get_current_stock(product)

                if adjustment_type == 'STOCK_IN':
                    movement_type = MovementType.STOCK_IN
                    delta = quantity

                elif adjustment_type == 'STOCK_OUT':
                    movement_type = MovementType.STOCK_OUT
                    delta = -quantity

                else:
                    movement_type = MovementType.ADJUSTMENT
                    delta = quantity - previous_stock

                product, movement, previous_stock, new_stock = (
                    create_stock_movement(
                        product_id=product.id,
                        movement_type=movement_type,
                        quantity_delta=delta,
                        reference_number=reference_no,
                        reason=reason,
                        user=request.user,
                    )
                )

                record_audit(
                    request.user,
                    'INVENTORY_ADJUSTMENT',
                    'INVENTORY',
                    (
                        f"Adjusted stock for '{product.name}' "
                        f"({previous_stock} -> {new_stock})"
                    ),
                    'Product',
                    product.id,
                    request,
                )

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            'message': 'Stock adjusted successfully.',
            'product_id': product.id,
            'previous_stock': previous_stock,
            'new_stock': new_stock,
            'movement': InventoryMovementSerializer(
                movement
            ).data,
        })


class ERPInventoryMovementsView(generics.ListAPIView):
    serializer_class = InventoryMovementSerializer
    permission_classes = [IsERPAuthenticated]

    def get_queryset(self):
        qs = InventoryMovement.objects.select_related(
            'product',
            'adjusted_by',
        ).order_by('-created_at', '-id')

        product_id = self.request.query_params.get(
            'product_id'
        )

        if product_id:
            qs = qs.filter(product_id=product_id)

        return qs[:100]


# --------------------------------------------------------------------------
# 9. SUPPLIERS AND PURCHASES
# --------------------------------------------------------------------------

class ERPSupplierViewSet(viewsets.ModelViewSet):
    serializer_class = ERPSupplierSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Supplier.objects.all().order_by('name')

        search = self.request.query_params.get('search')

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(contact_person__icontains=search)
                | Q(phone__icontains=search)
            )

        return qs


class ERPPurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ERPPurchaseOrderSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return (
            PurchaseOrder.objects
            .select_related('supplier', 'created_by')
            .prefetch_related('items__product')
            .order_by('-created_at')
        )

    def create(self, request, *args, **kwargs):
        supplier_id = request.data.get('supplier_id')
        expected_date = request.data.get('expected_date')
        notes = request.data.get('notes', '')
        items_data = request.data.get('items', [])

        if not supplier_id or not items_data:
            return Response(
                {
                    'error': (
                        'Supplier and order items are required.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        supplier = Supplier.objects.filter(
            id=supplier_id
        ).first()

        if not supplier:
            return Response(
                {'error': 'Supplier not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            with transaction.atomic():
                validated_items = []
                subtotal = Decimal('0.00')

                for item in items_data:
                    product_id = item.get('product_id')

                    unit_cost = Decimal(
                        str(item.get('unit_cost', 0))
                    )

                    quantity = int(
                        item.get('quantity', 1)
                    )

                    if unit_cost < 0 or quantity <= 0:
                        raise ValueError(
                            'Unit cost must be non-negative and '
                            'quantity must be greater than zero.'
                        )

                    product = Product.objects.filter(
                        id=product_id
                    ).first()

                    if not product:
                        raise ValueError(
                            f"Product ID {product_id} was not found."
                        )

                    total_cost = unit_cost * quantity

                    validated_items.append({
                        'product': product,
                        'unit_cost': unit_cost,
                        'quantity': quantity,
                        'total_cost': total_cost,
                    })

                    subtotal += total_cost

                po = PurchaseOrder.objects.create(
                    supplier=supplier,
                    expected_date=expected_date or None,
                    notes=notes,
                    created_by=request.user,
                )

                for item in validated_items:
                    PurchaseOrderItem.objects.create(
                        purchase_order=po,
                        product=item['product'],
                        unit_cost=item['unit_cost'],
                        quantity=item['quantity'],
                        total_cost=item['total_cost'],
                    )

                po.subtotal = subtotal
                po.total_amount = subtotal
                po.save(
                    update_fields=[
                        'subtotal',
                        'total_amount',
                    ]
                )

                record_audit(
                    request.user,
                    'CREATE_PURCHASE_ORDER',
                    'PURCHASES',
                    (
                        f"Created PO {po.po_number} for "
                        f"{supplier.name} (₹{po.total_amount})"
                    ),
                    'PurchaseOrder',
                    po.id,
                    request,
                )

        except (ValueError, InvalidOperation, TypeError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ERPPurchaseOrderSerializer(po).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='receive-goods',
    )
    def receive_goods(self, request, id=None):
        with transaction.atomic():
            po = (
                PurchaseOrder.objects
                .select_for_update()
                .select_related('supplier')
                .prefetch_related('items__product')
                .filter(id=id)
                .first()
            )

            if not po:
                return Response(
                    {'error': 'Purchase order not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if po.status == PurchaseOrderStatus.RECEIVED:
                return Response(
                    {
                        'error': (
                            'Goods for this purchase order '
                            'have already been received.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if po.status == PurchaseOrderStatus.CANCELLED:
                return Response(
                    {
                        'error': (
                            'Cancelled purchase orders cannot '
                            'receive goods.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for item in po.items.all():
                remaining_quantity = (
                    item.quantity - item.received_quantity
                )

                if remaining_quantity <= 0:
                    continue

                create_stock_movement(
                    product_id=item.product_id,
                    movement_type=MovementType.PURCHASE,
                    quantity_delta=remaining_quantity,
                    reference_number=po.po_number,
                    reason=(
                        f"Goods received from supplier "
                        f"'{po.supplier.name}' under {po.po_number}"
                    ),
                    user=request.user,
                )

                item.received_quantity += remaining_quantity
                item.save(
                    update_fields=['received_quantity']
                )

            po.status = PurchaseOrderStatus.RECEIVED
            po.received_at = timezone.now()
            po.save(
                update_fields=['status', 'received_at']
            )

            FinanceTransaction.objects.create(
                transaction_type=TransactionType.EXPENSE,
                category=TransactionCategory.PURCHASE,
                amount=po.total_amount,
                reference_po=po,
                description=(
                    f"Inventory procurement payment for "
                    f"{po.po_number} ({po.supplier.name})"
                ),
                transaction_date=timezone.now().date(),
                recorded_by=request.user,
            )

            record_audit(
                request.user,
                'RECEIVE_PO_GOODS',
                'PURCHASES',
                (
                    f"Received goods under {po.po_number}; "
                    f"inventory movements created."
                ),
                'PurchaseOrder',
                po.id,
                request,
            )

        return Response({
            'message': (
                'Goods received successfully and inventory updated.'
            ),
            'po': ERPPurchaseOrderSerializer(po).data,
        })


# --------------------------------------------------------------------------
# 10. FINANCE
# --------------------------------------------------------------------------

class ERPFinanceViewSet(viewsets.ModelViewSet):
    serializer_class = ERPFinanceTransactionSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = FinanceTransaction.objects.select_related(
            'recorded_by'
        ).order_by(
            '-transaction_date',
            '-created_at',
        )

        txn_type = self.request.query_params.get('type')

        if txn_type:
            qs = qs.filter(transaction_type=txn_type)

        return qs

    def perform_create(self, serializer):
        txn = serializer.save(
            recorded_by=self.request.user
        )

        record_audit(
            self.request.user,
            'CREATE_TRANSACTION',
            'FINANCE',
            (
                f"Recorded {txn.transaction_type}: "
                f"₹{txn.amount} ({txn.category})"
            ),
            'FinanceTransaction',
            txn.id,
            self.request,
        )

    @action(
        detail=False,
        methods=['get'],
        url_path='overview',
    )
    def finance_overview(self, request):
        now = timezone.now()

        this_month_start = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        total_income = (
            FinanceTransaction.objects.filter(
                transaction_type=TransactionType.INCOME
            ).aggregate(t=Sum('amount'))['t']
            or Decimal('0.00')
        )

        total_expense = (
            FinanceTransaction.objects.filter(
                transaction_type=TransactionType.EXPENSE
            ).aggregate(t=Sum('amount'))['t']
            or Decimal('0.00')
        )

        orders_revenue = (
            Order.objects.filter(
                status__in=[
                    OrderStatus.DELIVERED,
                    OrderStatus.SHIPPED,
                ]
            ).aggregate(t=Sum('total_amount'))['t']
            or Decimal('0.00')
        )

        combined_revenue = total_income + orders_revenue
        net_profit = combined_revenue - total_expense

        month_expense = (
            FinanceTransaction.objects.filter(
                transaction_type=TransactionType.EXPENSE,
                transaction_date__gte=this_month_start.date(),
            ).aggregate(t=Sum('amount'))['t']
            or Decimal('0.00')
        )

        month_revenue = (
            Order.objects.filter(
                status__in=[
                    OrderStatus.DELIVERED,
                    OrderStatus.SHIPPED,
                ],
                created_at__gte=this_month_start,
            ).aggregate(t=Sum('total_amount'))['t']
            or Decimal('0.00')
        )

        month_net = month_revenue - month_expense

        return Response({
            'total_revenue': float(combined_revenue),
            'total_expense': float(total_expense),
            'net_profit': float(net_profit),
            'current_month': {
                'revenue': float(month_revenue),
                'expense': float(month_expense),
                'net_profit': float(month_net),
            },
        })


# --------------------------------------------------------------------------
# 11. SHIPPING
# --------------------------------------------------------------------------

class ERPShipmentViewSet(viewsets.ModelViewSet):
    serializer_class = ERPShipmentSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Shipment.objects.select_related(
            'order'
        ).order_by('-created_at')

    @action(
        detail=True,
        methods=['post'],
        url_path='update-tracking',
    )
    def update_tracking(self, request, id=None):
        shipment = self.get_object()

        courier = request.data.get('courier_name')
        tracking = request.data.get('tracking_number')
        ship_status = request.data.get('shipping_status')

        if courier:
            shipment.courier_name = courier

        if tracking:
            shipment.tracking_number = tracking

        if ship_status:
            if ship_status not in ShippingStatus.values:
                return Response(
                    {'error': 'Invalid shipping status.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            shipment.shipping_status = ship_status

            if (
                ship_status == ShippingStatus.DISPATCHED
                and not shipment.dispatch_date
            ):
                shipment.dispatch_date = timezone.now()

            elif (
                ship_status == ShippingStatus.DELIVERED
                and not shipment.actual_delivery
            ):
                shipment.actual_delivery = timezone.now()

                shipment.order.status = OrderStatus.DELIVERED
                shipment.order.save(
                    update_fields=['status']
                )

        shipment.save()

        record_audit(
            request.user,
            'UPDATE_SHIPMENT',
            'SHIPPING',
            (
                f"Updated shipment for "
                f"{shipment.order.order_number}: "
                f"Courier: {shipment.courier_name}, "
                f"AWB: {shipment.tracking_number}"
            ),
            'Shipment',
            shipment.id,
            request,
        )

        return Response({
            'message': 'Shipment updated successfully',
            'shipment': ERPShipmentSerializer(
                shipment
            ).data,
        })


# --------------------------------------------------------------------------
# 12. EMPLOYEES AND AUDIT LOGS
# --------------------------------------------------------------------------

class ERPEmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeUserSerializer
    permission_classes = [IsAdminOrHigher]
    lookup_field = 'id'

    def get_queryset(self):
        return (
            User.objects
            .filter(is_superuser=False)
            .select_related('employee_profile')
            .order_by('-date_joined')
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='toggle-active',
    )
    def toggle_active(self, request, id=None):
        user = self.get_object()

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        if hasattr(user, 'employee_profile'):
            user.employee_profile.is_active = user.is_active
            user.employee_profile.save(
                update_fields=['is_active']
            )

        state = (
            'activated'
            if user.is_active
            else 'deactivated'
        )

        record_audit(
            request.user,
            'TOGGLE_EMPLOYEE_ACTIVE',
            'EMPLOYEES',
            f"Employee {user.username} {state}",
            'User',
            user.id,
            request,
        )

        return Response({
            'message': f"Employee account {state}",
            'is_active': user.is_active,
        })


class ERPAuditLogViewSet(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrHigher]

    def get_queryset(self):
        qs = AuditLog.objects.select_related(
            'user'
        ).order_by('-timestamp')

        module = self.request.query_params.get('module')

        if module:
            qs = qs.filter(module__iexact=module)

        return qs[:150]


# --------------------------------------------------------------------------
# 13. CSV REPORT EXPORTS
# --------------------------------------------------------------------------

class ERPReportsExportView(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        report_type = request.query_params.get(
            'type',
            'sales',
        )

        response = HttpResponse(
            content_type='text/csv'
        )

        now_str = datetime.now().strftime(
            '%Y%m%d_%H%M'
        )

        response['Content-Disposition'] = (
            f'attachment; filename="raj_baratham_'
            f'{report_type}_{now_str}.csv"'
        )

        writer = csv.writer(response)

        if report_type == 'sales':
            writer.writerow([
                'Order Number',
                'Date',
                'Customer Name',
                'Phone',
                'Payment Method',
                'Payment Status',
                'Order Status',
                'Total Amount (INR)',
            ])

            orders = Order.objects.all().order_by(
                '-created_at'
            )

            for order in orders:
                writer.writerow([
                    order.order_number,
                    order.created_at.strftime(
                        '%Y-%m-%d %H:%M'
                    ),
                    order.customer_name,
                    order.customer_phone,
                    order.payment_method,
                    order.payment_status,
                    order.status,
                    order.total_amount,
                ])

        elif report_type == 'inventory':
            writer.writerow([
                'Product ID',
                'Product Name',
                'Selling Price (INR)',
                'Stock Quantity',
                'Stock Valuation (INR)',
            ])

            products = products_with_stock().order_by(
                'name'
            )

            for product in products:
                stock = product.current_stock

                writer.writerow([
                    product.id,
                    product.name,
                    product.price,
                    stock,
                    product.price * stock,
                ])

        elif report_type == 'customers':
            writer.writerow([
                'Customer Name',
                'Phone',
                'Email',
                'City',
                'State',
                'Orders Count',
                'Total Spent (INR)',
                'Date Joined',
            ])

            customers = Customer.objects.all().order_by(
                '-created_at'
            )

            for customer in customers:
                writer.writerow([
                    customer.name,
                    customer.phone,
                    customer.email or '-',
                    customer.city or '-',
                    customer.state or '-',
                    customer.total_orders_count,
                    customer.total_spent_amount,
                    customer.created_at.strftime(
                        '%Y-%m-%d'
                    ),
                ])

        else:
            return Response(
                {
                    'error': (
                        'Unsupported report type. '
                        'Use sales, inventory, or customers.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return response
