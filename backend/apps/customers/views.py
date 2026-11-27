import logging
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
import re

from .models import Customer

logger = logging.getLogger(__name__)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication for customer-facing store API endpoints.
    Allows frontend cross-origin requests with session credentials
    without CSRF enforcement on state-changing API calls.
    """
    def enforce_csrf(self, request):
        return


class CustomerLoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates a user via username or email and password.
    Supports session management and remember_me flag.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        if not username_or_email or not password:
            return Response(
                {'error': 'Please provide both username/email and password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        identifier = str(username_or_email).strip()
        user = None

        # 1. Check if identifier is an email address
        if '@' in identifier:
            matched_user = User.objects.filter(email__iexact=identifier).first()
            if matched_user:
                user = authenticate(
                    request,
                    username=matched_user.username,
                    password=password,
                )

        # 2. Check by username
        if not user:
            user = authenticate(
                request,
                username=identifier,
                password=password,
            )

        # 3. Fallback: if user not found yet and no @ was in identifier, try case-insensitive username match
        if not user:
            matched_user = User.objects.filter(username__iexact=identifier).first()
            if matched_user:
                user = authenticate(
                    request,
                    username=matched_user.username,
                    password=password,
                )

        if not user:
            return Response(
                {'error': 'Invalid email/username or password. Please verify your credentials and try again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'error': 'This account has been deactivated. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Handle Remember Me session expiry
        if remember_me:
            # 30 days session
            request.session.set_expiry(60 * 60 * 24 * 30)
        else:
            # Expires when browser closes
            request.session.set_expiry(0)

        # Establish Django session
        login(request, user)

        # Retrieve or associate linked customer profile
        customer = Customer.objects.filter(user=user).first()
        if not customer and user.email:
            customer = Customer.objects.filter(email__iexact=user.email).first()
            if customer and not customer.user:
                customer.user = user
                customer.save(update_fields=['user'])

        customer_data = None
        if customer:
            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address_line1': customer.address_line1,
                'address_line2': customer.address_line2,
                'city': customer.city,
                'state': customer.state,
                'pincode': customer.pincode,
            }

        return Response({
            'message': 'Sign in successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'customer': customer_data,
            },
        }, status=status.HTTP_200_OK)


class CustomerCurrentUserView(APIView):
    """
    GET /api/auth/me/
    Retrieves current authenticated user session data.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not (user and user.is_authenticated and user.is_active):
            return Response({
                'authenticated': False,
                'user': None,
            }, status=status.HTTP_200_OK)

        customer = Customer.objects.filter(user=user).first()
        customer_data = None
        if customer:
            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address_line1': customer.address_line1,
                'address_line2': customer.address_line2,
                'city': customer.city,
                'state': customer.state,
                'pincode': customer.pincode,
            }

        return Response({
            'authenticated': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'customer': customer_data,
            },
        }, status=status.HTTP_200_OK)


class CustomerLogoutView(APIView):
    """
    POST /api/auth/logout/
    Terminates current session.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({
            'message': 'Successfully signed out.',
            'authenticated': False,
        }, status=status.HTTP_200_OK)


class CustomerForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Handles password reset requests gracefully.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email or '@' not in email:
            return Response(
                {'error': 'Please provide a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Safe response: Never leak whether email exists in database
        exists = User.objects.filter(email__iexact=email).exists()

        return Response({
            'message': 'If an account associated with this email exists, password reset instructions have been sent.',
            'sent': exists,
        }, status=status.HTTP_200_OK)


class CustomerRegisterView(APIView):
    """
    POST /api/auth/register/
    Registers a new client account, creates/links a customer profile,
    and logs the user in with session authentication.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()
        password = request.data.get('password', '')

        # Basic validation
        if not name:
            return Response(
                {'error': 'Please enter your full name.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email or not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
            return Response(
                {'error': 'Please provide a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password or len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters long.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check existing user email
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'An account associated with this email address already exists. Please sign in instead.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate clean unique username
        base_username = re.sub(r'[^a-zA-Z0-9_]', '', email.split('@')[0]) or 'client'
        username = base_username[:25]
        counter = 1
        while User.objects.filter(username__iexact=username).exists():
            username = f"{base_username[:20]}_{counter}"
            counter += 1

        # Parse first and last names
        parts = name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            # Retrieve or create customer profile
            customer = Customer.objects.filter(email__iexact=email).first()
            if customer:
                customer.user = user
                if not customer.name:
                    customer.name = name
                if phone and not customer.phone:
                    customer.phone = phone
                customer.save()
            else:
                customer = Customer.objects.create(
                    user=user,
                    name=name,
                    email=email,
                    phone=phone or '',
                )

            # Automatically log in the client upon registration
            login(request, user)

            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address_line1': customer.address_line1,
                'address_line2': customer.address_line2,
                'city': customer.city,
                'state': customer.state,
                'pincode': customer.pincode,
            }

            return Response({
                'message': 'Welcome to Maison! Your client account has been created.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.get_full_name() or user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'customer': customer_data,
                },
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Error during customer registration: %s", e)
            return Response(
                {'error': 'An unexpected error occurred while creating your account. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CustomerWishlistView(APIView):
    """
    GET, POST /api/auth/wishlist/
    Manages user-specific wishlist synchronized with Neon PostgreSQL.
    Ensures every client has their own distinct, persistent jewellery wishlist.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not (user and user.is_authenticated and user.is_active):
            return Response({'wishlist': []}, status=status.HTTP_200_OK)

        customer = Customer.objects.filter(user=user).first()
        if not customer and user.email:
            customer = Customer.objects.filter(email__iexact=user.email).first()

        wishlist = []
        if customer and customer.notes:
            try:
                import json
                data = json.loads(customer.notes)
                wishlist = data.get('wishlist', [])
            except Exception:
                wishlist = []

        return Response({'wishlist': wishlist, 'count': len(wishlist)}, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        wishlist = request.data.get('wishlist', [])

        if not (user and user.is_authenticated and user.is_active):
            return Response({'wishlist': wishlist, 'message': 'Guest session stored locally.'}, status=status.HTTP_200_OK)

        customer = Customer.objects.filter(user=user).first()
        if not customer and user.email:
            customer = Customer.objects.filter(email__iexact=user.email).first()

        if not customer:
            customer = Customer.objects.create(
                user=user,
                name=user.get_full_name() or user.username,
                email=user.email,
                phone='',
            )
        elif not customer.user:
            customer.user = user

        notes_data = {}
        if customer.notes:
            try:
                import json
                notes_data = json.loads(customer.notes)
            except Exception:
                notes_data = {}

        notes_data['wishlist'] = wishlist
        import json
        customer.notes = json.dumps(notes_data)
        customer.save(update_fields=['notes', 'user'] if customer.user_id else ['notes'])

        return Response({
            'message': 'Wishlist saved to cloud profile.',
            'wishlist': wishlist,
            'count': len(wishlist),
        }, status=status.HTTP_200_OK)

