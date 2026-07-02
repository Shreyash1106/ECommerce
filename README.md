# 🛒 E-Commerce Platform

A full-featured e-commerce application with React frontend and FastAPI backend, featuring role-based access control, real-time analytics, and comprehensive order management.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)
- [Features](#features)
- [Project Status](#project-status)

---

## 🎯 Project Overview

This is a production-ready e-commerce platform built with:
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** FastAPI + PostgreSQL + SQLAlchemy
- **State Management:** Zustand + React Query
- **Authentication:** JWT tokens
- **Real-time:** WebSocket support for notifications

The application supports three user roles:
- **Admin:** Full system control, user management, analytics
- **Vendor:** Product management, order fulfillment, sales analytics
- **Customer:** Browse products, place orders, track shipments

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router DOM** - Client-side routing
- **Zustand** - State management
- **React Query (@tanstack/react-query)** - Server state management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **JWT** - Authentication
- **WebSocket** - Real-time communication
- **Uvicorn** - ASGI server

---

## 📁 Project Structure

```
ECommerce/
├── backend/                          # FastAPI backend application
│   ├── app/
│   │   ├── api/                     # API route handlers
│   │   │   ├── admin.py            # Admin-specific endpoints
│   │   │   ├── analytics.py        # Analytics endpoints
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── email_verification.py
│   │   │   ├── inventory.py       # Inventory management
│   │   │   ├── notifications.py    # Notification endpoints
│   │   │   ├── orders.py           # Order management
│   │   │   ├── products.py        # Product CRUD
│   │   │   ├── reports.py          # Report generation
│   │   │   └── search.py           # Search functionality
│   │   ├── constants/              # Application constants
│   │   │   └── analytics.py        # Analytics constants
│   │   ├── core/                    # Core functionality
│   │   │   └── security.py         # Security utilities (JWT, password hashing)
│   │   ├── database/                # Database configuration
│   │   │   ├── base.py             # Base model class
│   │   │   └── session.py          # Database session management
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── address.py          # User address model
│   │   │   ├── cart.py             # Shopping cart model
│   │   │   ├── category.py         # Product category model
│   │   │   ├── coupon.py           # Discount coupon model
│   │   │   ├── inventory.py        # Inventory tracking model
│   │   │   ├── notification.py     # Notification model
│   │   │   ├── order.py           # Order model
│   │   │   ├── product.py         # Product model
│   │   │   ├── product_image.py    # Product images model
│   │   │   ├── user.py             # User model
│   │   │   └── wishlist.py         # Wishlist model
│   │   ├── schemas/                 # Pydantic schemas for validation
│   │   │   ├── analytics.py        # Analytics data schemas
│   │   │   ├── category.py         # Category schemas
│   │   │   ├── inventory.py        # Inventory schemas
│   │   │   ├── notification.py     # Notification schemas
│   │   │   ├── order.py           # Order schemas
│   │   │   ├── product.py         # Product schemas
│   │   │   ├── product_search.py  # Search schemas
│   │   │   ├── report.py          # Report schemas
│   │   │   └── user.py            # User schemas
│   │   ├── services/                # Business logic layer
│   │   │   ├── analytics_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── category_service.py
│   │   │   ├── email_service.py
│   │   │   ├── inventory_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── order_service.py
│   │   │   ├── product_service.py
│   │   │   └── user_service.py
│   │   └── utils/                   # Utility functions
│   ├── .env                         # Environment variables
│   ├── requirements.txt             # Python dependencies
│   └── .venv/                       # Python virtual environment
│
├── frontend/                        # React frontend application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # API client functions
│   │   │   ├── adminApi.js         # Admin API calls
│   │   │   ├── client.js           # Axios client configuration
│   │   │   ├── recommendationApi.js # Product recommendation API
│   │   │   ├── vendorApi.js        # Vendor API calls
│   │   │   └── websocket.js        # WebSocket client
│   │   ├── components/              # Reusable React components
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Header.jsx     # Navigation header
│   │   │   │   └── Sidebar.jsx    # Sidebar navigation
│   │   │   └── ui/                 # UI components
│   │   │       ├── AppImage.jsx   # Image component
│   │   │       ├── Badge.jsx      # Badge component
│   │   │       ├── Card.jsx       # Card component
│   │   │       ├── EmptyState.jsx # Empty state display
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── Modal.jsx      # Modal dialog
│   │   │       ├── Pagination.jsx # Pagination component
│   │   │       ├── SearchInput.jsx
│   │   │       └── StatCard.jsx   # Statistics card
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.jsx        # Authentication hook
│   │   │   ├── useAnalytics.js    # Analytics data hook
│   │   │   └── useAnalyticsData.js
│   │   ├── pages/                   # Page components
│   │   │   ├── AdminAnalytics.jsx  # Admin analytics dashboard
│   │   │   ├── AdminDashboard.jsx  # Admin main dashboard
│   │   │   ├── AdminNotifications.jsx
│   │   │   ├── AdminOrders.jsx     # Order management
│   │   │   ├── AdminProducts.jsx   # Product management
│   │   │   ├── AdminUsers.jsx      # User management
│   │   │   ├── AuditLogs.jsx       # System audit logs
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── NotFound.jsx        # 404 page
│   │   │   ├── ProductDetail.jsx   # Product details
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── SearchResults.jsx   # Search results page
│   │   │   ├── Settings.jsx        # User settings
│   │   │   ├── VendorAnalytics.jsx # Vendor analytics
│   │   │   ├── VendorDashboard.jsx # Vendor dashboard
│   │   │   ├── VendorOrders.jsx    # Vendor order management
│   │   │   └── VendorProducts.jsx  # Vendor product management
│   │   ├── store/                   # State management
│   │   │   └── useStore.js         # Zustand store
│   │   ├── App.jsx                  # Main App component
│   │   ├── index.css                # Global styles
│   │   ├── main.jsx                 # React entry point
│   │   └── queryClient.js           # React Query configuration
│   ├── .env                         # Environment variables
│   ├── index.html                   # HTML template
│   ├── package.json                 # Node dependencies
│   ├── tailwind.config.cjs          # TailwindCSS configuration
│   ├── vite.config.js               # Vite configuration
│   └── node_modules/                # Installed npm packages
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🚀 Quick Start

Get the application running in under 5 minutes:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ECommerce
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🔧 Detailed Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment:**
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

6. **Setup database** (see [Database Setup](#database-setup))

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

---

## ⚙️ Environment Configuration

### Backend (.env)
Create a `.env` file in the `backend/` directory:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ECommerce
SECRET_KEY=your-secret-key-here-generate-a-long-random-string
DEBUG=False
```

### Frontend (.env)
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE ECommerce;
```

### 2. Run Database Initialization
```bash
cd backend
python -c "from app.database.base import Base; from app.database.session import engine; Base.metadata.create_all(bind=engine)"
```

Or use the provided script (if available):
```bash
python create_db.py
```

### 3. Verify Tables
Connect to your PostgreSQL database and verify tables were created:
- users
- products
- categories
- orders
- inventory
- notifications
- And more...

---

## 🏃 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist/` directory.

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products/` - Create product (Admin/Vendor)
- `PUT /api/products/{id}` - Update product (Admin/Vendor)
- `DELETE /api/products/{id}` - Delete product (Admin/Vendor)

#### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/sales` - Sales data
- `GET /api/analytics/reports` - Generate reports

---

## 🔐 Demo Credentials

Use these credentials to test the application:

**Admin Account:**
```
Email: admin@demo.com
Password: demo123
```

**Vendor Account:**
```
Email: vendor@demo.com
Password: demo123
```

**Customer Account:**
```
Email: customer@demo.com
Password: demo123
```

---

## ✨ Features

### User Features
- ✅ User registration and authentication
- ✅ Role-based access control (Admin/Vendor/Customer)
- ✅ Profile management
- ✅ Address management

### Product Features
- ✅ Product browsing and search
- ✅ Category filtering
- ✅ Product details and images
- ✅ Product recommendations
- ✅ Wishlist functionality

### Order Features
- ✅ Shopping cart
- ✅ Order placement
- ✅ Order tracking
- ✅ Order history
- ✅ Coupon/discount codes

### Admin Features
- ✅ User management
- ✅ Product management
- ✅ Order management
- ✅ Analytics dashboard
- ✅ Sales reports
- ✅ Inventory management
- ✅ Notification system

### Vendor Features
- ✅ Product catalog management
- ✅ Order fulfillment
- ✅ Sales analytics
- ✅ Inventory tracking

### Technical Features
- ✅ JWT authentication
- ✅ Real-time notifications (WebSocket)
- ✅ Responsive design
- ✅ Error handling
- ✅ Input validation
- ✅ File upload support
- ✅ CORS enabled
- ✅ Comprehensive API documentation

---

## 📊 Project Status

**✅ PRODUCTION READY**

The application is fully functional and ready for deployment. All features have been implemented and tested:

- ✅ All hardcoded data removed - using real database queries
- ✅ Complete frontend-backend integration
- ✅ Authentication and authorization working
- ✅ All CRUD operations functional
- ✅ Analytics and reporting complete
- ✅ Real-time notifications working
- ✅ File upload system working
- ✅ Search functionality implemented
- ✅ Responsive design complete

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For support, email support@example.com or open an issue in the repository.

---

**Happy Coding! 🎉**
