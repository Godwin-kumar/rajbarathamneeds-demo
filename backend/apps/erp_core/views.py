import csv
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

logger = logging.getLogger(__name__)

from .models import EmployeeProfile, EmployeeRole, AuditLog
from .permissions import IsERPAuthenticated, IsSuperAdmin, IsAdminOrHigher
from .serializers import (
    EmployeeUserSerializer, AuditLogSerializer,
    ERPProductSerializer, ERPCategorySerializer, ERPPromotionSerializer,
    ERPCustomerSerializer, ERPOrderSerializer, OrderStatusHistorySerializer,
    InventoryMovementSerializer, ERPSupplierSerializer, ERPPurchaseOrderSerializer,
    ERPFinanceTransactionSerializer, ERPShipmentSerializer, ProductImageDetailSerializer
)
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.promotions.models import Promotion
from apps.customers.models import Customer
from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus, OrderStatusHistory
from apps.inventory.models import InventoryMovement, MovementType
from apps.purchases.models import Supplier, PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus
from apps.finance.models import FinanceTransaction, TransactionType, TransactionCategory
from apps.shipping.models import Shipment, ShippingStatus
from services.imagekit_service import imagekit_service


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

def record_audit(user, action_name, module, description, affected_model=None, affected_id=None, request=None, changes=None):
    try:
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action_name,
            module=module,
            description=description,
            ip_address=get_client_ip(request) if request else None,
            affected_model=affected_model,
            affected_object_id=str(affected_id) if affected_id else None,
            changes_json=changes or {}
        )
    except Exception as e:
        logger.warning(f"Failed to record audit log: {e}")


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
                status=status.HTTP_400_BAD_REQUEST
            )

        username = str(username).strip()

        # Allow logging in with either username or email
        user = None
        if '@' in username:
            matched_user = User.objects.filter(email__iexact=username).first()
            if matched_user:
                user = authenticate(request, username=matched_user.username, password=password)
        if not user:
            user = authenticate(request, username=username, password=password)

        if not user:
            record_audit(None, 'LOGIN_FAILED', 'AUTH', f"Failed login attempt for '{username}'", request=request)
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'This employee account has been deactivated.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Ensure employee profile exists or create for superuser / staff
        profile = getattr(user, 'employee_profile', None)
        if not profile:
            role = EmployeeRole.SUPER_ADMIN if user.is_superuser else EmployeeRole.ADMIN
            profile, _ = EmployeeProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'department': 'Executive Management' if user.is_superuser else 'Operations',
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
                    }
                }
            )

        if not profile.is_active:
            return Response(
                {'error': 'Your ERP access has been suspended. Please contact administrator.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Perform secure Django session login
        login(request, user)
        record_audit(user, 'LOGIN_SUCCESS', 'AUTH', f"Employee {user.username} logged into ERP", affected_model='User', affected_id=user.id, request=request)

        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                'role': profile.role,
                'department': profile.department,
                'is_superuser': user.is_superuser,
                'permissions': profile.module_permissions or {},
            }
        })


class ERPCurrentUserView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not (user and user.is_authenticated and user.is_active):
            return Response(
                {'authenticated': False, 'error': 'Not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profile = getattr(user, 'employee_profile', None)
        if not profile:
            role = EmployeeRole.SUPER_ADMIN if user.is_superuser else EmployeeRole.ADMIN
            try:
                profile, _ = EmployeeProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'role': role,
                        'department': 'Executive Management' if user.is_superuser else 'Operations',
                        'is_active': True,
                    }
                )
            except Exception as e:
                logger.warning(f"Could not auto-create employee profile for {user.username}: {e}")

        return Response({
            'authenticated': True,
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name() or user.username,
            'role': profile.role if profile else ('SUPER_ADMIN' if user.is_superuser else 'ADMIN'),
            'department': profile.department if profile else 'Executive Management',
            'is_superuser': user.is_superuser,
            'permissions': profile.module_permissions if profile else {},
        })


from rest_framework.authentication import SessionAuthentication

class UnsafeMethodsCsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Allow logout without requiring CSRF token header


class ERPLogoutView(views.APIView):
    authentication_classes = [UnsafeMethodsCsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            record_audit(request.user, 'LOGOUT', 'AUTH', f"Employee {request.user.username} logged out", request=request)
        logout(request)
        return Response({'message': 'Logged out successfully'})


# --------------------------------------------------------------------------
# 2. DASHBOARD REAL POSTGRESQL STATS
# --------------------------------------------------------------------------
class ERPDashboardStatsView(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        date_filter = request.query_params.get('filter', '30days')
        now = timezone.now()

        # Date range calculation
        if date_filter == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_filter == 'yesterday':
            yesterday = now - timedelta(days=1)
            start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_filter == '7days':
            start_date = now - timedelta(days=7)
        elif date_filter == 'this_month':
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif date_filter == 'last_month':
            first_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            start_date = (first_this_month - timedelta(days=28)).replace(day=1)
        else: # 30days
            start_date = now - timedelta(days=30)

        # 1. Product & Category counts
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=5, is_active=True).count()
        total_categories = Category.objects.filter(is_active=True).count()

        # 2. Orders & Revenue (Delivered / Shipped / Confirmed / Processing)
        valid_orders_qs = Order.objects.filter(status__in=[OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED])
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status=OrderStatus.PENDING).count()
        completed_orders = Order.objects.filter(status=OrderStatus.DELIVERED).count()

        # Total lifetime revenue
        lifetime_revenue = valid_orders_qs.aggregate(rev=Sum('total_amount'))['rev'] or Decimal('0.00')

        # Filtered period revenue
        period_orders = valid_orders_qs.filter(created_at__gte=start_date)
        period_revenue = period_orders.aggregate(rev=Sum('total_amount'))['rev'] or Decimal('0.00')
        period_orders_count = Order.objects.filter(created_at__gte=start_date).count()

        # 3. Customer count
        total_customers = Customer.objects.count()

        # 4. Recent Orders (Last 5)
        recent_orders = ERPOrderSerializer(Order.objects.order_by('-created_at')[:6], many=True).data

        # 5. Low stock alerts (Up to 5)
        low_stock_items = Product.objects.filter(stock_quantity__lte=5, is_active=True).values('id', 'name', 'sku', 'stock_quantity', 'price')[:6]

        # 6. Monthly revenue trend for chart (last 6 months)
        monthly_trend = []
        for i in range(5, -1, -1):
            m_date = now - timedelta(days=i * 30)
            m_start = m_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if m_start.month == 12:
                m_end = m_start.replace(year=m_start.year + 1, month=1)
            else:
                m_end = m_start.replace(month=m_start.month + 1)

            m_rev = valid_orders_qs.filter(created_at__gte=m_start, created_at__lt=m_end).aggregate(r=Sum('total_amount'))['r'] or 0
            m_orders = Order.objects.filter(created_at__gte=m_start, created_at__lt=m_end).count()

            monthly_trend.append({
                'month': m_start.strftime('%b %Y'),
                'revenue': float(m_rev),
                'orders': m_orders
            })

        # 7. Inventory Total Valuation
        inventory_valuation = Product.objects.filter(is_active=True).aggregate(
            val=Sum(F('price') * F('stock_quantity'))
        )['val'] or Decimal('0.00')

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
                'inventory_valuation': float(inventory_valuation),
            },
            'recent_orders': recent_orders,
            'low_stock_items': list(low_stock_items),
            'monthly_trend': monthly_trend,
        })


# --------------------------------------------------------------------------
# 3. PRODUCTS MANAGEMENT CRUD & MULTI-IMAGE UPLOAD
# --------------------------------------------------------------------------
class ERPProductViewSet(viewsets.ModelViewSet):
    serializer_class = ERPProductSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('images').order_by('-created_at')
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(sku__icontains=search) | Q(description__icontains=search))

        # Category filter
        cat = self.request.query_params.get('category')
        if cat and cat != 'all':
            if cat.isdigit():
                qs = qs.filter(category_id=int(cat))
            else:
                qs = qs.filter(category__slug=cat)

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.filter(is_active=True)
        elif status_param == 'inactive':
            qs = qs.filter(is_active=False)
        elif status_param == 'low_stock':
            qs = qs.filter(stock_quantity__lte=5)

        return qs

    def perform_create(self, serializer):
        product = serializer.save()
        record_audit(self.request.user, 'CREATE_PRODUCT', 'PRODUCTS', f"Created product '{product.name}' (SKU: {product.sku})", 'Product', product.id, self.request)

    def perform_update(self, serializer):
        product = serializer.save()
        record_audit(self.request.user, 'UPDATE_PRODUCT', 'PRODUCTS', f"Updated product '{product.name}' (SKU: {product.sku})", 'Product', product.id, self.request)

    def perform_destroy(self, instance):
        name = instance.name
        pid = instance.id
        instance.delete()
        record_audit(self.request.user, 'DELETE_PRODUCT', 'PRODUCTS', f"Deleted product '{name}' (ID: {pid})", 'Product', pid, self.request)

    @action(detail=True, methods=['post'], url_path='upload-images')
    def upload_images(self, request, id=None):
        product = self.get_object()
        files = request.FILES.getlist('images') or request.FILES.getlist('image')
        
        if not files:
            return Response({'error': 'No image files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded = []
        is_first = not product.images.filter(is_primary=True).exists()

        for idx, file_obj in enumerate(files):
            try:
                # Upload directly to ImageKit
                clean_name = f"{product.slug or 'jewel'}_{idx}_{file_obj.name.replace(' ', '_')}"
                res = imagekit_service.upload_image(file_obj, clean_name, folder="/jewellery/products/")
                
                img_url = res.get('url')
                file_id = res.get('file_id')

                prod_img = ProductImage.objects.create(
                    product=product,
                    image_url=img_url,
                    imagekit_file_id=file_id,
                    alt_text=f"{product.name} - View {idx + 1}",
                    display_order=product.images.count() + 1,
                    is_primary=is_first and (idx == 0)
                )
                uploaded.append(ProductImageDetailSerializer(prod_img).data)
            except Exception as e:
                return Response({'error': f"Failed to upload image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        record_audit(request.user, 'UPLOAD_IMAGES', 'PRODUCTS', f"Uploaded {len(uploaded)} images for '{product.name}'", 'Product', product.id, request)
        return Response({'message': f"Uploaded {len(uploaded)} images successfully", 'images': uploaded})

    @action(detail=True, methods=['delete'], url_path='delete-image/(?P<image_id>[^/.]+)')
    def delete_image(self, request, id=None, image_id=None):
        product = self.get_object()
        img = product.images.filter(id=image_id).first()
        if not img:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

        if img.imagekit_file_id:
            try:
                imagekit_service.delete_image(img.imagekit_file_id)
            except Exception:
                pass
        img.delete()
        record_audit(request.user, 'DELETE_IMAGE', 'PRODUCTS', f"Deleted image #{image_id} from '{product.name}'", 'Product', product.id, request)
        return Response({'message': 'Image deleted successfully'})


# --------------------------------------------------------------------------
# 4. CATEGORIES CRUD
# --------------------------------------------------------------------------
class ERPCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ERPCategorySerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Category.objects.all().order_by('display_order', 'name')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs

    def perform_create(self, serializer):
        cat = serializer.save()
        record_audit(self.request.user, 'CREATE_CATEGORY', 'CATEGORIES', f"Created category '{cat.name}'", 'Category', cat.id, self.request)

    def perform_update(self, serializer):
        cat = serializer.save()
        record_audit(self.request.user, 'UPDATE_CATEGORY', 'CATEGORIES', f"Updated category '{cat.name}'", 'Category', cat.id, self.request)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        prod_count = category.products.count()
        if prod_count > 0:
            return Response(
                {'error': f"Cannot delete '{category.name}' because it contains {prod_count} product(s). Please reassign or delete these products first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        name = category.name
        cid = category.id
        category.delete()
        record_audit(request.user, 'DELETE_CATEGORY', 'CATEGORIES', f"Deleted category '{name}' (ID: {cid})", 'Category', cid, request)
        return Response({'message': f"Category '{name}' deleted successfully"}, status=status.HTTP_200_OK)


# --------------------------------------------------------------------------
# 5. PROMOTIONS CRUD
# --------------------------------------------------------------------------
class ERPPromotionViewSet(viewsets.ModelViewSet):
    serializer_class = ERPPromotionSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Promotion.objects.all().order_by('display_order', '-created_at')

    def perform_create(self, serializer):
        promo = serializer.save()
        record_audit(self.request.user, 'CREATE_PROMOTION', 'PROMOTIONS', f"Created promotion '{promo.title}'", 'Promotion', promo.id, self.request)

    def perform_update(self, serializer):
        promo = serializer.save()
        record_audit(self.request.user, 'UPDATE_PROMOTION', 'PROMOTIONS', f"Updated promotion '{promo.title}'", 'Promotion', promo.id, self.request)

    def perform_destroy(self, instance):
        title = instance.title
        pid = instance.id
        instance.delete()
        record_audit(self.request.user, 'DELETE_PROMOTION', 'PROMOTIONS', f"Deleted promotion '{title}' (ID: {pid})", 'Promotion', pid, self.request)


# --------------------------------------------------------------------------
# 6. ORDERS CRUD & STATUS TRANSITIONS
# --------------------------------------------------------------------------
class ERPOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ERPOrderSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items', 'status_history').order_by('-created_at')

        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'ALL':
            qs = qs.filter(status=status_param)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(order_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer_phone__icontains=search) |
                Q(customer_email__icontains=search)
            )

        return qs

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, id=None):
        order = self.get_object()
        new_status = request.data.get('status')
        comment = request.data.get('comment', '')

        if new_status not in OrderStatus.values:
            return Response({'error': f"Invalid status '{new_status}'"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        if old_status == new_status:
            return Response({'message': 'Status unchanged', 'order': ERPOrderSerializer(order).data})

        with transaction.atomic():
            order.status = new_status
            
            # If marked delivered, update payment status if COD
            if new_status == OrderStatus.DELIVERED and order.payment_method == 'COD':
                order.payment_status = PaymentStatus.PAID

            order.save()

            # Record status history
            OrderStatusHistory.objects.create(
                order=order,
                from_status=old_status,
                to_status=new_status,
                changed_by=request.user,
                comment=comment
            )

            # If cancelled, restore stock
            if new_status == OrderStatus.CANCELLED and old_status != OrderStatus.CANCELLED:
                for item in order.items.all():
                    if item.product:
                        prev = item.product.stock_quantity
                        item.product.stock_quantity += item.quantity
                        item.product.save(update_fields=['stock_quantity'])
                        InventoryMovement.objects.create(
                            product=item.product,
                            movement_type=MovementType.RETURN,
                            quantity=item.quantity,
                            previous_stock=prev,
                            new_stock=item.product.stock_quantity,
                            reference_number=order.order_number,
                            reason=f"Order {order.order_number} cancelled: {comment}",
                            adjusted_by=request.user
                        )

            # Record audit
            record_audit(
                request.user, 'ORDER_STATUS_CHANGE', 'ORDERS',
                f"Order {order.order_number} transitioned {old_status} -> {new_status}",
                'Order', order.id, request
            )

        return Response({
            'message': f"Order status updated to {new_status}",
            'order': ERPOrderSerializer(order).data
        })


# --------------------------------------------------------------------------
# 7. CUSTOMERS
# --------------------------------------------------------------------------
class ERPCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ERPCustomerSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Customer.objects.prefetch_related('orders').order_by('-created_at')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search) | Q(email__icontains=search))
        return qs


# --------------------------------------------------------------------------
# 8. INVENTORY MANAGEMENT & MOVEMENTS
# --------------------------------------------------------------------------
class ERPInventoryViewSet(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        products = Product.objects.select_related('category').order_by('stock_quantity', 'name')
        search = request.query_params.get('search')
        if search:
            products = products.filter(Q(name__icontains=search) | Q(sku__icontains=search))

        items = []
        for p in products:
            items.append({
                'id': p.id,
                'name': p.name,
                'sku': p.sku,
                'category_name': p.category.name if p.category else 'Uncategorized',
                'stock_quantity': p.stock_quantity,
                'price': float(p.price),
                'total_valuation': float(p.price * p.stock_quantity),
                'is_low_stock': p.stock_quantity <= 5,
                'is_active': p.is_active,
                'primary_image': p.primary_image.image_url if p.primary_image else None
            })

        return Response({'products': items})

    def post(self, request):
        """
        Stock Adjustment: stock-in, stock-out, or manual correction
        """
        product_id = request.data.get('product_id')
        adjustment_type = request.data.get('type', 'ADJUSTMENT') # STOCK_IN, STOCK_OUT, ADJUSTMENT
        delta = request.data.get('quantity')
        reason = request.data.get('reason', 'Manual Inventory Adjustment')
        reference_no = request.data.get('reference_number', '')

        if not product_id or delta is None:
            return Response({'error': 'Product and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            delta = int(delta)
        except ValueError:
            return Response({'error': 'Quantity must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            prev_stock = product.stock_quantity
            
            if adjustment_type == 'STOCK_IN':
                new_stock = prev_stock + abs(delta)
                final_delta = abs(delta)
            elif adjustment_type == 'STOCK_OUT':
                if prev_stock < abs(delta):
                    return Response({'error': f"Cannot remove {abs(delta)} units; current stock is only {prev_stock}."}, status=status.HTTP_400_BAD_REQUEST)
                new_stock = prev_stock - abs(delta)
                final_delta = -abs(delta)
            else: # ADJUSTMENT (Absolute target stock)
                new_stock = max(0, delta)
                final_delta = new_stock - prev_stock

            product.stock_quantity = new_stock
            product.save(update_fields=['stock_quantity'])

            movement = InventoryMovement.objects.create(
                product=product,
                movement_type=adjustment_type if adjustment_type in MovementType.values else MovementType.ADJUSTMENT,
                quantity=final_delta,
                previous_stock=prev_stock,
                new_stock=new_stock,
                reference_number=reference_no,
                reason=reason,
                adjusted_by=request.user
            )

            record_audit(
                request.user, 'INVENTORY_ADJUSTMENT', 'INVENTORY',
                f"Adjusted stock for '{product.name}' ({prev_stock} -> {new_stock}, delta: {final_delta})",
                'Product', product.id, request
            )

        return Response({
            'message': 'Stock adjusted successfully',
            'product_id': product.id,
            'previous_stock': prev_stock,
            'new_stock': new_stock,
            'movement': InventoryMovementSerializer(movement).data
        })


class ERPInventoryMovementsView(generics.ListAPIView):
    serializer_class = InventoryMovementSerializer
    permission_classes = [IsERPAuthenticated]

    def get_queryset(self):
        qs = InventoryMovement.objects.select_related('product', 'adjusted_by').order_by('-created_at')
        prod_id = self.request.query_params.get('product_id')
        if prod_id:
            qs = qs.filter(product_id=prod_id)
        return qs[:100]


# --------------------------------------------------------------------------
# 9. SUPPLIERS & PURCHASES
# --------------------------------------------------------------------------
class ERPSupplierViewSet(viewsets.ModelViewSet):
    serializer_class = ERPSupplierSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Supplier.objects.all().order_by('name')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(contact_person__icontains=search) | Q(phone__icontains=search))
        return qs


class ERPPurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ERPPurchaseOrderSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return PurchaseOrder.objects.select_related('supplier', 'created_by').prefetch_related('items__product').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        supplier_id = request.data.get('supplier_id')
        expected_date = request.data.get('expected_date')
        notes = request.data.get('notes', '')
        items_data = request.data.get('items', [])

        if not supplier_id or not items_data:
            return Response({'error': 'Supplier and order items are required.'}, status=status.HTTP_400_BAD_REQUEST)

        supplier = Supplier.objects.filter(id=supplier_id).first()
        if not supplier:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            po = PurchaseOrder.objects.create(
                supplier=supplier,
                expected_date=expected_date or None,
                notes=notes,
                created_by=request.user
            )

            subtotal = Decimal('0.00')
            for item in items_data:
                product_id = item.get('product_id')
                unit_cost = Decimal(str(item.get('unit_cost', 0)))
                qty = int(item.get('quantity', 1))

                product = Product.objects.filter(id=product_id).first()
                if product:
                    PurchaseOrderItem.objects.create(
                        purchase_order=po,
                        product=product,
                        unit_cost=unit_cost,
                        quantity=qty,
                        total_cost=unit_cost * qty
                    )
                    subtotal += (unit_cost * qty)

            po.subtotal = subtotal
            po.total_amount = subtotal
            po.save(update_fields=['subtotal', 'total_amount'])

            record_audit(request.user, 'CREATE_PURCHASE_ORDER', 'PURCHASES', f"Created PO {po.po_number} for {supplier.name} (₹{po.total_amount})", 'PurchaseOrder', po.id, request)

        return Response(ERPPurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='receive-goods')
    def receive_goods(self, request, id=None):
        po = self.get_object()
        if po.status == PurchaseOrderStatus.RECEIVED:
            return Response({'error': 'Goods for this purchase order have already been received.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            po.status = PurchaseOrderStatus.RECEIVED
            po.received_at = timezone.now()
            po.save()

            # Increase stock for each item in the PO
            for item in po.items.all():
                product = item.product
                prev_stock = product.stock_quantity
                product.stock_quantity += item.quantity
                product.save(update_fields=['stock_quantity'])

                item.received_quantity = item.quantity
                item.save(update_fields=['received_quantity'])

                InventoryMovement.objects.create(
                    product=product,
                    movement_type=MovementType.PURCHASE,
                    quantity=item.quantity,
                    previous_stock=prev_stock,
                    new_stock=product.stock_quantity,
                    reference_number=po.po_number,
                    reason=f"Goods received from Supplier '{po.supplier.name}' under {po.po_number}",
                    adjusted_by=request.user
                )

            # Auto-record expense transaction
            FinanceTransaction.objects.create(
                transaction_type=TransactionType.EXPENSE,
                category=TransactionCategory.PURCHASE,
                amount=po.total_amount,
                reference_po=po,
                description=f"Inventory procurement payment for {po.po_number} ({po.supplier.name})",
                transaction_date=timezone.now().date(),
                recorded_by=request.user
            )

            record_audit(request.user, 'RECEIVE_PO_GOODS', 'PURCHASES', f"Received all goods under {po.po_number}, inventory updated", 'PurchaseOrder', po.id, request)

        return Response({'message': 'Goods received successfully and stock incremented.', 'po': ERPPurchaseOrderSerializer(po).data})


# --------------------------------------------------------------------------
# 10. FINANCE TRANSACTIONS & P&L
# --------------------------------------------------------------------------
class ERPFinanceViewSet(viewsets.ModelViewSet):
    serializer_class = ERPFinanceTransactionSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        qs = FinanceTransaction.objects.select_related('recorded_by').order_by('-transaction_date', '-created_at')
        txn_type = self.request.query_params.get('type')
        if txn_type:
            qs = qs.filter(transaction_type=txn_type)
        return qs

    def perform_create(self, serializer):
        txn = serializer.save(recorded_by=self.request.user)
        record_audit(self.request.user, 'CREATE_TRANSACTION', 'FINANCE', f"Recorded {txn.transaction_type}: ₹{txn.amount} ({txn.category})", 'FinanceTransaction', txn.id, self.request)

    @action(detail=False, methods=['get'], url_path='overview')
    def finance_overview(self, request):
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Total income from delivered orders or direct transactions
        total_income = FinanceTransaction.objects.filter(transaction_type=TransactionType.INCOME).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        total_expense = FinanceTransaction.objects.filter(transaction_type=TransactionType.EXPENSE).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        
        # Add actual delivered order revenue
        orders_revenue = Order.objects.filter(status__in=[OrderStatus.DELIVERED, OrderStatus.SHIPPED]).aggregate(t=Sum('total_amount'))['t'] or Decimal('0.00')
        combined_revenue = total_income + orders_revenue
        net_profit = combined_revenue - total_expense

        # Monthly figures
        month_expense = FinanceTransaction.objects.filter(transaction_type=TransactionType.EXPENSE, transaction_date__gte=this_month_start).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        month_revenue = Order.objects.filter(status__in=[OrderStatus.DELIVERED, OrderStatus.SHIPPED], created_at__gte=this_month_start).aggregate(t=Sum('total_amount'))['t'] or Decimal('0.00')
        month_net = month_revenue - month_expense

        return Response({
            'total_revenue': float(combined_revenue),
            'total_expense': float(total_expense),
            'net_profit': float(net_profit),
            'current_month': {
                'revenue': float(month_revenue),
                'expense': float(month_expense),
                'net_profit': float(month_net)
            }
        })


# --------------------------------------------------------------------------
# 11. SHIPPING & LOGISTICS
# --------------------------------------------------------------------------
class ERPShipmentViewSet(viewsets.ModelViewSet):
    serializer_class = ERPShipmentSerializer
    permission_classes = [IsERPAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Shipment.objects.select_related('order').order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='update-tracking')
    def update_tracking(self, request, id=None):
        shipment = self.get_object()
        courier = request.data.get('courier_name')
        tracking = request.data.get('tracking_number')
        ship_status = request.data.get('shipping_status')

        if courier:
            shipment.courier_name = courier
        if tracking:
            shipment.tracking_number = tracking
        if ship_status and ship_status in ShippingStatus.values:
            shipment.shipping_status = ship_status
            if ship_status == ShippingStatus.DISPATCHED and not shipment.dispatch_date:
                shipment.dispatch_date = timezone.now()
            elif ship_status == ShippingStatus.DELIVERED and not shipment.actual_delivery:
                shipment.actual_delivery = timezone.now()
                # Also transition order status to DELIVERED
                shipment.order.status = OrderStatus.DELIVERED
                shipment.order.save(update_fields=['status'])

        shipment.save()
        record_audit(request.user, 'UPDATE_SHIPMENT', 'SHIPPING', f"Updated shipment for {shipment.order.order_number}: Courier: {shipment.courier_name}, AWB: {shipment.tracking_number}", 'Shipment', shipment.id, request)
        return Response({'message': 'Shipment updated successfully', 'shipment': ERPShipmentSerializer(shipment).data})


# --------------------------------------------------------------------------
# 12. EMPLOYEES & AUDIT LOGS
# --------------------------------------------------------------------------
class ERPEmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeUserSerializer
    permission_classes = [IsAdminOrHigher]
    lookup_field = 'id'

    def get_queryset(self):
        return User.objects.filter(is_superuser=False).select_related('employee_profile').order_by('-date_joined')

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, id=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        if hasattr(user, 'employee_profile'):
            user.employee_profile.is_active = user.is_active
            user.employee_profile.save(update_fields=['is_active'])

        state = 'activated' if user.is_active else 'deactivated'
        record_audit(request.user, 'TOGGLE_EMPLOYEE_ACTIVE', 'EMPLOYEES', f"Employee {user.username} {state}", 'User', user.id, request)
        return Response({'message': f"Employee account {state}", 'is_active': user.is_active})


class ERPAuditLogViewSet(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrHigher]

    def get_queryset(self):
        qs = AuditLog.objects.select_related('user').order_by('-timestamp')
        module = self.request.query_params.get('module')
        if module:
            qs = qs.filter(module__iexact=module)
        return qs[:150]


# --------------------------------------------------------------------------
# 13. CSV / REPORT EXPORTS
# --------------------------------------------------------------------------
class ERPReportsExportView(views.APIView):
    permission_classes = [IsERPAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'sales') # sales, inventory, customers

        response = HttpResponse(content_type='text/csv')
        now_str = datetime.now().strftime('%Y%m%d_%H%M')
        response['Content-Disposition'] = f'attachment; filename="raj_baratham_{report_type}_{now_str}.csv"'

        writer = csv.writer(response)

        if report_type == 'sales':
            writer.writerow(['Order Number', 'Date', 'Customer Name', 'Phone', 'Payment Method', 'Payment Status', 'Order Status', 'Total Amount (INR)'])
            orders = Order.objects.all().order_by('-created_at')
            for o in orders:
                writer.writerow([o.order_number, o.created_at.strftime('%Y-%m-%d %H:%M'), o.customer_name, o.customer_phone, o.payment_method, o.payment_status, o.status, o.total_amount])

        elif report_type == 'inventory':
            writer.writerow(['Product Name', 'SKU', 'Category', 'Selling Price (INR)', 'Stock Quantity', 'Stock Valuation (INR)', 'Status'])
            products = Product.objects.select_related('category').all().order_by('name')
            for p in products:
                writer.writerow([p.name, p.sku, p.category.name if p.category else '-', p.price, p.stock_quantity, p.price * p.stock_quantity, 'Active' if p.is_active else 'Inactive'])

        elif report_type == 'customers':
            writer.writerow(['Customer Name', 'Phone', 'Email', 'City', 'State', 'Orders Count', 'Total Spent (INR)', 'Date Joined'])
            customers = Customer.objects.all().order_by('-created_at')
            for c in customers:
                writer.writerow([c.name, c.phone, c.email or '-', c.city or '-', c.state or '-', c.total_orders_count, c.total_spent_amount, c.created_at.strftime('%Y-%m-%d')])

        return response
