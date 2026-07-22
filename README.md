# 🛒 CommerceOS — Senior Enterprise E-Commerce SaaS Marketplace

A commercial-grade, multi-vendor e-commerce marketplace platform inspired by **Amazon, Shopify, Flipkart, and Apple Store**. Built with a **React 18 + Vite + TailwindCSS + Framer Motion** frontend and a **FastAPI + PostgreSQL + SQLAlchemy** backend featuring a database-backed Mock Payment Gateway, pre-checkout cart validation, 51 OpenAPI endpoints, and real-time WebSockets.

---

## 💎 Key Features & Architecture Highlights

### 🎨 Frontend (Amazon & Apple Inspired Light Theme)
- **Framer Motion Micro-Interactions**: Hover lift cards (`rounded-[20px]`), 48px height commercial button system (`rounded-[14px]`), smooth tab transitions.
- **Top Sticky Mega Header**: Glass blur header (`backdrop-blur-md bg-white/90`), search bar, wishlist counter, notifications bell, cart badge, and sub-header toolbar.
- **Multi-Step Checkout & Cart**: Grouped cart items, GST 18%, shipping rules, promo code validation (`SAVE10`), and 5-step checkout progress bar.
- **Product Details Page Overhaul**: Interactive multi-thumbnail gallery, sticky purchase card (`sticky top-28`), 24-hr express shipping estimate, certified seller info, and tabbed specifications.
- **Mobile Bottom Navigation**: 20px touch-target mobile navigation bar (`Home`, `Search`, `Cart`, `Orders`, `Profile`).

### ⚙️ Enterprise Backend (FastAPI + PostgreSQL)
- **Standardized Response Model**: `APIResponse[T]` & `PaginatedResponse[T]` schemas (`success`, `message`, `data`, `meta`, `errors`).
- **Fake Payment Gateway Engine**: Database-backed payment engine (`Payment` ORM model) generating unique `payment_id`, `transaction_id`, `receipt_number`, gateway name ("MockPay Enterprise"), invoice metadata, auto-reducing inventory stock, and creating status history records.
- **Pre-Checkout Validation Service**: Verifies product stock availability, coupon discounts, GST 18%, shipping fee ($15 or free over $100), and grand totals.
- **51 OpenAPI Endpoints**: Documented and verified under `http://localhost:8000/docs`.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - High-performance build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Production animations & transitions
- **Zustand** - Global state management with LocalStorage persistence
- **React Query (@tanstack/react-query)** - Server state management & caching
- **Axios** - HTTP Client
- **Recharts** - Enterprise data visualization
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Relational database engine
- **SQLAlchemy** - Enterprise ORM
- **Pydantic v2** - Schema serialization & strict data validation
- **Passlib & PyJWT** - Security, password hashing & JWT authentication
- **WebSockets** - Real-time notifications and order timeline updates

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
> Access OpenAPI Documentation at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Access Frontend Application at: `http://localhost:5173`

---

## 👥 User Roles & Demo Credentials

| Role | Username / Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Full system control, marketplace analytics, user/vendor management |
| **Vendor** | `vendor@example.com` | `vendor123` | Product catalog, store orders, inventory tracking, sales analytics |
| **Customer** | `customer@example.com` | `customer123` | Product discovery, wishlist, shopping cart, checkout, saved addresses |

---

## 📄 License & Attribution

Commercial-grade SaaS marketplace architecture designed for production deployment, portfolio demonstrations, and enterprise client projects.
