# Luxury Jewellery E-Commerce — Full-Stack Application
## Phase 1: Django Backend + Neon PostgreSQL + ImageKit + Homepage Integration

A high-performance, scalable jewellery e-commerce platform featuring:
- **React.js + Vite** luxury frontend (Pure White + Soft Ivory design system)
- **Django 5.2 + Django REST Framework** backend
- **Neon Cloud PostgreSQL** database via `psycopg`
- **ImageKit Cloud Storage & CDN** for optimized image delivery

---

## 1. Project Architecture

```
ECOMMERCE-WEBSITE/
├── frontend/                          # React + Vite Client Application
│   ├── public/                        # Static assets, luxury favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                # ImagePlaceholder, Button, SectionHeading
│   │   │   ├── layout/                # Navbar, MobileMenu, Footer, AnnouncementBar
│   │   │   └── home/                  # HeroBanner, CategorySection, FeaturedProducts, NewArrivals, etc.
│   │   ├── pages/home/Home.jsx        # Homepage with Django REST API integration
│   │   ├── services/
│   │   │   ├── apiClient.js           # Centralized API fetcher
│   │   │   ├── homepageService.js     # Consolidated homepage API service
│   │   │   ├── productService.js      # Catalogue service
│   │   │   ├── categoryService.js     # Category service
│   │   │   └── bannerService.js       # Promotional banner service
│   │   ├── context/WishlistContext.jsx # Wishlist state management
│   │   └── styles/                    # Tailwind CSS luxury theme
│   ├── .env.example                   # Frontend environment configuration template
│   └── package.json
│
├── backend/                           # Django REST Framework Application
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py                # Base configuration & apps
│   │   │   ├── development.py         # Development settings & CORS
│   │   │   └── production.py          # Production security headers
│   │   ├── urls.py                    # Root URL router
│   │   └── wsgi.py / asgi.py
│   ├── apps/
│   │   ├── store_settings/            # Store metadata, currency, contact, logo
│   │   ├── categories/                # Jewellery categories & hierarchy
│   │   ├── products/                  # Products, ProductImages, FeaturedProducts
│   │   ├── promotions/                # Homepage banners & promotional privileges
│   │   └── homepage/                  # Consolidated GET /api/store/home/ endpoint
│   ├── services/
│   │   └── imagekit_service.py        # ImageKit SDK client (upload, delete, responsive CDN URLs)
│   ├── common/
│   │   ├── permissions.py             # Staff & admin permission policies
│   │   ├── pagination.py              # StandardResultsSetPagination
│   │   ├── validators.py              # Image and price validators
│   │   └── exceptions.py              # Standardized API error handler
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── test_db_connection.py          # Neon PostgreSQL diagnostic tool
│   ├── test_imagekit_connection.py    # ImageKit diagnostic tool
│   ├── manage.py
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 2. Environment Configuration

### Backend Credentials (`backend/.env`)
Create `backend/.env` (copied from `backend/.env.example`) and fill in your external credentials:

```ini
# Django Core
SECRET_KEY=your_secure_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Neon Cloud PostgreSQL
# Obtain from your Neon Console (https://console.neon.tech)
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require

# ImageKit Cloud Storage & CDN
# Obtain from your ImageKit Developer Portal (https://imagekit.io/dashboard/developer/api-keys)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 3. Quick Start & Testing

### Step 1: Set Up Backend Virtual Environment
```bash
# Activate existing virtualenv
.\backend\venv\Scripts\activate

# Test Neon PostgreSQL connection
python backend/test_db_connection.py

# Test ImageKit configuration
python backend/test_imagekit_connection.py
```

### Step 2: Apply Migrations to Neon PostgreSQL
```bash
python backend/manage.py migrate
```

### Step 3: Create Admin Superuser
```bash
python backend/manage.py createsuperuser
```

### Step 4 (Optional): Seed Sample Jewellery Data
To instantly populate sample categories, featured creations, and promotional banners:
```bash
python backend/manage.py seed_demo_data
```

### Step 5: Start Django REST API Server
```bash
python backend/manage.py runserver 8000
```
- Django Admin Portal: `http://localhost:8000/admin/`
- Homepage API Endpoint: `http://localhost:8000/api/store/home/`

### Step 6: Start React Frontend Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` to view the homepage connected to your Django API.

---

## 4. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/store/home/` | Consolidated payload: store settings, banners, categories, featured creations, new arrivals, promotions |
| `GET` | `/api/categories/` | Active categories in display order with active product counts |
| `GET` | `/api/products/` | Filterable, searchable product catalogue with pagination (`?search=`, `?category=`, `?page=`) |
| `GET` | `/api/products/featured/` | Curated featured creations |
| `GET` | `/api/products/new-arrivals/` | Latest seasonal additions |
| `GET` | `/api/products/{slug}/` | Complete product details with all ordered ImageKit photographs |
| `GET` | `/api/promotions/` | Active promotional campaigns |
| `GET` | `/api/promotions/banners/` | Active hero campaign banners |

---

## 5. Django Admin ImageKit Workflow

When creating or editing a **Product**, **Category**, **Banner**, or **Promotion** in Django Admin (`/admin/`):
1. Select an image file from your local drive.
2. Saving the record automatically sends the file directly to **ImageKit cloud storage**.
3. The resulting CDN URL and ImageKit `file_id` are saved in **Neon PostgreSQL**.
4. Deleting a product image in the admin automatically deletes the corresponding file in ImageKit.
5. Responsive, WebP/AVIF optimized thumbnails are rendered in the admin list views.
