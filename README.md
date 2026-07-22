# Enterprise Multi-Vendor E-Commerce Marketplace Platform

A production-grade, full-stack multi-vendor marketplace architecture built with **FastAPI, PostgreSQL, SQLAlchemy, React, Vite, and TailwindCSS**. Inspired by modern commercial platforms like **Amazon, Shopify, Apple, and Flipkart**.

---

## 🌟 Key Architecture & Features

### 🛍️ Customer Commerce Experience
- **Modern Marketplace Showcase**: Hero carousel, countdown timers, brand showcase, category grid, dynamic product filtering.
- **Product Detail Engine**: Multi-thumbnail gallery, sticky purchase card, certified seller info, specifications tabs.
- **Shopping Cart & Pre-Checkout**: Stock validation, GST 18% calculation, promo code engine (`SAVE10`, `PROMO20`), estimated shipping fee calculation.
- **5-Step Checkout**: Address selection, delivery speed, payment gateway, order review, instant confirmation.
- **Order History & Amazon Tracking**: 6-step progress timeline modal (`Pending` -> `Confirmed` -> `Packed` -> `Shipped` -> `Out For Delivery` -> `Delivered`).
- **Tax Invoice & Receipt Engine**: Downloadable & printable PDF tax receipts with merchant GST registration numbers.
- **Returns & Refunds Hub**: Delivered order return request form, 7-step Amazon Return Timeline, printable refund receipt, auto-inventory restocking.

### 🏬 Vendor Business Suite
- **Vendor Wallet & Payout Engine**: Available Balance, Escrow Pending Earnings, Total Withdrawn, Payout Withdrawal Modal (`HDFC / ICICI` bank transfers).
- **Store Profile & Verification**: Store logo/banner branding, business address, working hours, GST/PAN registration verification (`Approved`, `Under Review`).
- **Seller Scorecard & Reviews**: Overall Seller Rating (4.85 / 5.0), 99.2% Order Acceptance Rate, customer reviews management table & merchant reply drawer.
- **Inventory & CSV Bulk Operations**: CSV Template Download (`products_import_template.csv`) and bulk catalog updates.

### 🛡️ Admin CMS & Business Management Platform
- **Homepage CMS & Banners**: Hero Banner CRUD, publish/expiry date scheduling, banner priority.
- **Site Settings & Policy Editor**: Company Info, GST Number, Tax %, Shipping rules, Policy Pages editor (About Us, Privacy, Terms, Refund Policy).
- **Email Notification Templates**: Live previewer for Order Confirmation, Invoice, Refund, Welcome, and Vendor Approval emails.
- **Telemetry & Audit Trail**: Active user tracking, CPU/RAM stats, failed payment logs, Admin Audit Logs table.

---

## 👥 Permanent Admin & Demo Credentials

| Role | Username / Email | Permanent Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `shreyashtbc@gmail.com` | `1234567890` | Full system control, marketplace analytics, user/vendor management |
| **Admin (Backup)** | `admin@example.com` | `1234567890` | Full system control & emergency fallback |
| **Vendor** | `vendor1@example.com` | `1234567890` | Product catalog, store orders, inventory tracking, sales analytics |
| **Customer** | `john@example.com` | `1234567890` | Product discovery, wishlist, shopping cart, checkout, saved addresses |

---

## 📄 License & Attribution

Commercial-grade SaaS marketplace architecture designed for production deployment, portfolio demonstrations, and enterprise client projects.
