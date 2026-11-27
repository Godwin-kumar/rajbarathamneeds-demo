
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import EmployeeProfile, AuditLog, EmployeeRole
from apps.categories.models import Category
from apps.products.models import Product, ProductSideImage
from apps.promotions.models import Promotion
from apps.customers.models import Customer
from apps.orders.models import Order, OrderItem, OrderStatusHistory
from apps.inventory.models import InventoryMovement
from apps.purchases.models import Supplier, PurchaseOrder, PurchaseOrderItem
from apps.finance.models import FinanceTransaction
from apps.shipping.models import Shipment


# --------------------------------------------------------------------------
# AUTH & EMPLOYEES
# --------------------------------------------------------------------------

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = [
            'id',
            'role',
            'department',
            'phone',
            'module_permissions',
            'is_active',
            'created_at'
        ]


class EmployeeUserSerializer(serializers.ModelSerializer):
    employee_profile = EmployeeProfileSerializer(read_only=True)

    role = serializers.CharField(
        write_only=True,
        required=False,
        default=EmployeeRole.EMPLOYEE
    )
    department = serializers.CharField(
        write_only=True,
        required=False,
        default='Operations'
    )
    phone = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
            'date_joined',
            'employee_profile',
            'role',
            'department',
            'phone',
            'password'
        ]

    def create(self, validated_data):
        role = validated_data.pop(
            'role',
            EmployeeRole.EMPLOYEE
        )
        department = validated_data.pop(
            'department',
            'Operations'
        )
        phone = validated_data.pop('phone', '')
        password = validated_data.pop(
            'password',
            None
        ) or 'Admin@12345'

        user = User.objects.create_user(**validated_data)
        user.set_password(password)

        if role in [
            EmployeeRole.SUPER_ADMIN,
            EmployeeRole.ADMIN
        ]:
            user.is_staff = True

        user.save()

        EmployeeProfile.objects.create(
            user=user,
            role=role,
            department=department,
            phone=phone,
            is_active=True
        )

        return user


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username',
        default='System',
        read_only=True
    )

    user_full_name = serializers.CharField(
        source='user.get_full_name',
        default='',
        read_only=True
    )

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'username',
            'user_full_name',
            'action',
            'module',
            'description',
            'ip_address',
            'affected_model',
            'affected_object_id',
            'changes_json',
            'timestamp'
        ]


# --------------------------------------------------------------------------
# PRODUCTS & SIDE IMAGES
# --------------------------------------------------------------------------

class ProductSideImageDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSideImage
        fields = [
            'id',
            'image_url',
            'display_order'
        ]


class ERPProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True,
        default=None
    )
    side_images = ProductSideImageDetailSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'price',
            'description',
            'dimensions',
            'main_image',
            'side_images'
        ]

        read_only_fields = ['id']


# --------------------------------------------------------------------------
# CATEGORIES
# --------------------------------------------------------------------------

class ERPCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
        ]

        read_only_fields = ['id']


# --------------------------------------------------------------------------
# PROMOTIONS
# --------------------------------------------------------------------------

class ERPPromotionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True,
        default=None
    )

    class Meta:
        model = Promotion
        fields = [
            'id',
            'title',
            'product',
            'product_name',
            'discount_type',
            'discount_value',
            'is_active',
        ]
        read_only_fields = ['id']


# --------------------------------------------------------------------------
# CUSTOMERS
# --------------------------------------------------------------------------

class ERPCustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.IntegerField(
        source='total_orders_count',
        read_only=True
    )

    total_spent = serializers.DecimalField(
        source='total_spent_amount',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'pincode',
            'notes',
            'is_active',
            'total_orders',
            'total_spent',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]


# --------------------------------------------------------------------------
# ORDERS & ITEMS
# --------------------------------------------------------------------------

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_sku',
            'unit_price',
            'quantity',
            'total_price'
        ]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source='changed_by.get_full_name',
        default='System',
        read_only=True
    )

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by_name',
            'comment',
            'created_at'
        ]


class ERPOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    status_history = OrderStatusHistorySerializer(
        many=True,
        read_only=True
    )

    items_count = serializers.IntegerField(
        source='items.count',
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer',
            'customer_name',
            'customer_email',
            'customer_phone',
            'shipping_address',
            'shipping_city',
            'shipping_state',
            'shipping_pincode',
            'status',
            'payment_status',
            'payment_method',
            'subtotal',
            'discount_amount',
            'tax_amount',
            'shipping_amount',
            'total_amount',
            'coupon_code',
            'notes',
            'items_count',
            'items',
            'status_history',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'order_number',
            'created_at',
            'updated_at'
        ]


# --------------------------------------------------------------------------
# INVENTORY
# --------------------------------------------------------------------------

class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    adjusted_by_name = serializers.CharField(
        source='adjusted_by.get_full_name',
        default='System',
        read_only=True
    )

    class Meta:
        model = InventoryMovement
        fields = [
            'id',
            'product',
            'product_name',
            'movement_type',
            'quantity',
            'previous_stock',
            'new_stock',
            'reference_number',
            'reason',
            'adjusted_by_name',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'created_at'
        ]


# --------------------------------------------------------------------------
# SUPPLIERS & PURCHASES
# --------------------------------------------------------------------------

class ERPSupplierSerializer(serializers.ModelSerializer):
    po_count = serializers.IntegerField(
        source='purchase_orders.count',
        read_only=True
    )

    class Meta:
        model = Supplier
        fields = [
            'id',
            'name',
            'contact_person',
            'email',
            'phone',
            'address',
            'gst_number',
            'is_active',
            'po_count',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'unit_cost',
            'quantity',
            'received_quantity',
            'total_cost'
        ]


class ERPPurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(
        many=True,
        read_only=True
    )

    supplier_name = serializers.CharField(
        source='supplier.name',
        read_only=True
    )

    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        default='System',
        read_only=True
    )

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'po_number',
            'supplier',
            'supplier_name',
            'order_date',
            'expected_date',
            'status',
            'payment_status',
            'subtotal',
            'tax_amount',
            'total_amount',
            'notes',
            'created_by_name',
            'received_at',
            'items',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'po_number',
            'created_at'
        ]


# --------------------------------------------------------------------------
# FINANCE & TRANSACTIONS
# --------------------------------------------------------------------------

class ERPFinanceTransactionSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source='recorded_by.get_full_name',
        default='System',
        read_only=True
    )

    class Meta:
        model = FinanceTransaction
        fields = [
            'id',
            'transaction_number',
            'transaction_type',
            'category',
            'amount',
            'payment_method',
            'reference_order',
            'reference_po',
            'description',
            'transaction_date',
            'recorded_by_name',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'transaction_number',
            'created_at'
        ]


# --------------------------------------------------------------------------
# SHIPPING
# --------------------------------------------------------------------------

class ERPShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(
        source='order.order_number',
        read_only=True
    )

    customer_name = serializers.CharField(
        source='order.customer_name',
        read_only=True
    )

    customer_phone = serializers.CharField(
        source='order.customer_phone',
        read_only=True
    )

    class Meta:
        model = Shipment
        fields = [
            'id',
            'order',
            'order_number',
            'customer_name',
            'customer_phone',
            'courier_name',
            'tracking_number',
            'dispatch_date',
            'estimated_delivery',
            'actual_delivery',
            'shipping_status',
            'shipping_cost',
            'shipping_address',
            'notes',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]
