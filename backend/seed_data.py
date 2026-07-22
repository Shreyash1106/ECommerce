import os
import sys
import random
from datetime import datetime, timedelta

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.order import Order
from app.models.address import Address
from app.models.notification import Notification
from app.services.auth_service import get_password_hash

PRODUCT_IMAGES = {
    # Electronics (16 items)
    "Wireless Noise Canceling Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    "UltraSlim Smartwatch Series 7": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    "Mechanical Gaming Keyboard RGB": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    "4K Ultra HD Curved Monitor 32\"": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
    "Portable Bluetooth Speaker Waterproof": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
    "Wireless Ergonomic Optical Mouse": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    "True Wireless Earbuds ANC": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    "Fast Charging Power Bank 20000mAh": "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80",
    "Apple iPhone 15 Pro Max (128GB)": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    "Sony PlayStation 5 Wireless Controller": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    "Apple iPad Air M2 11-inch": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    "Canon EOS 200D II DSLR Camera": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    "Dell XPS 15 Intel Core i9 Laptop": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
    "Noise ColorFit Pro 4 Smartwatch": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
    "boAt Airdopes 141 Bluetooth Earbuds": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4d?auto=format&fit=crop&w=600&q=80",
    "Logitech HD Webcam 1080p": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=600&q=80",

    # Clothing (16 items)
    "Classic Denim Jacket": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
    "Cotton Casual Slim Fit Shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    "Running Sneakers Air Breathable": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "Leather Crossbody Shoulder Bag": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    "Thermal Fleece Winter Hoodie": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    "Slim Fit Chino Pants": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
    "Designer Polarized Sunglasses": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
    "Sport Performance Athletic Shorts": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80",
    "Safari Unisex Waterproof Backpack 35L": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    "Adidas Ultraboost Running Shoes": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80",
    "Puma Casual Leather Sneakers": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
    "Women's Elegant Floral Summer Dress": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    "Men's Leather Biker Jacket Black": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    "Premium Silk Necktie & Cufflinks Set": "https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=600&q=80",
    "Women's Winter Wool Trench Coat": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80",
    "Formal Oxford Leather Shoes": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80",

    # Books (16 items)
    "The Clean Coder: Software Craftsman": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    "Design Patterns: Elements of Reusable OOP": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    "Atomic Habits by James Clear": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    "Deep Work by Cal Newport": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "System Design Interview Guide": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    "Zero to One by Peter Thiel": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
    "The Pragmatic Programmer 20th Ed": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    "Thinking, Fast and Slow": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    "Psychology of Money by Morgan Housel": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    "Rich Dad Poor Dad by Robert Kiyosaki": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    "Clean Code: Handbook of Agile Software Craftsmanship": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    "Read People Like a Book by Patrick King": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    "Can't Hurt Me by David Goggins": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "Ikigai: Japanese Secret to a Long and Happy Life": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
    "The Alchemist by Paulo Coelho": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    "Start With Why by Simon Sinek": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",

    # Home & Garden (16 items)
    "Stainless Steel Cookware Set 10-Piece": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
    "Smart Robot Vacuum Cleaner WiFi": "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=600&q=80",
    "Ergonomic Mesh Office Chair": "https://images.unsplash.com/photo-1580481074668-07356b38e9f2?auto=format&fit=crop&w=600&q=80",
    "Aromatic Essential Oil Diffuser": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    "Smart LED Desk Lamp Touch Control": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    "Memory Foam Orthopedic Pillow": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
    "Air Fryer Max XL 5.8 Quart": "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80",
    "Non-Stick Ceramic Frying Pan 10\"": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    "Nespresso Vertuo Espresso Coffee Machine": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
    "Stainless Steel Electric Kitchen Blender 1200W": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80",
    "Modern Ceramic Flower Vase Home Decor": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
    "Soft Egyptian Cotton 4-Piece Sheet Set": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80",
    "Smart Indoor Garden Herb Kit with LED": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    "Cast Iron Dutch Oven Pot 6 Quart": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
    "Automatic Touchless Trash Can 13 Gallon": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
    "High Pressure Shower Head with Filter": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",

    # Sports (16 items)
    "Adjustable Dumbbell Set 50lbs": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
    "Non-Slip Yoga Mat Extra Thick": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
    "Pro Basketball Official Size 7": "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80",
    "Insulated Stainless Water Bottle 32oz": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    "Trekking Backpack 50L Waterproof": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80",
    "Resistance Bands Exercise Set": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80",
    "Smart Jump Rope with Digital Counter": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    "Badminton Racket Twin Pack with Shuttlecocks": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
    "Folding Electric Treadmill 2.5HP Motor": "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=600&q=80",
    "Indoor Exercise Stationary Bike": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    "Premium Tennis Racket Pro 100sq": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80",
    "Camping Tent 4-Person Waterproof Instant": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    "Heavy Duty Boxing Punching Bag 80lbs": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=600&q=80",
    "Swimming Goggles Anti-Fog UV Protection": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80",
    "Skateboard Complete Pro 8-inch Maple": "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=600&q=80",
    "Football Official Match Size 5": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80",
}

DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"

def seed_database():
    print("🌱 Starting Permanent Admin & 80 Products Database Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # ----------------------------------------------------
        # 1. CATEGORIES (5 Categories)
        # ----------------------------------------------------
        categories_data = [
            {"name": "Electronics", "description": "Gadgets, smartphones, and accessories"},
            {"name": "Clothing", "description": "Men's and Women's fashion apparel"},
            {"name": "Books", "description": "Fiction, non-fiction, and educational books"},
            {"name": "Home & Garden", "description": "Decor, cookware, and garden items"},
            {"name": "Sports", "description": "Fitness gear, activewear, and outdoor equipment"},
        ]
        
        categories_map = {}
        for cat_in in categories_data:
            cat = db.query(Category).filter(Category.name == cat_in["name"]).first()
            if not cat:
                cat = Category(name=cat_in["name"], description=cat_in["description"])
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories_map[cat.name] = cat

        # ----------------------------------------------------
        # 2. PERMANENT ADMIN & USERS SEEDING
        # ----------------------------------------------------
        admin_pwd = get_password_hash("1234567890")
        default_pwd = get_password_hash("1234567890")
        
        users_raw = [
            ("shreyash_admin", "shreyashtbc@gmail.com", "Shreyash", "Admin", "admin", "+919876543200", 60),
            ("admin_user", "admin@example.com", "System", "Admin", "admin", "+919876543201", 60),
            ("tech_vendor", "vendor1@example.com", "Alex", "Vendor", "vendor", "+919876543202", 55),
            ("style_vendor", "vendor2@example.com", "Sophia", "Vendor", "vendor", "+919876543203", 52),
            ("gear_vendor", "vendor3@example.com", "David", "Vendor", "vendor", "+919876543204", 50),
            
            ("john_buyer", "john@example.com", "John", "Doe", "customer", "+919876543205", 45),
            ("sarah_buyer", "sarah@example.com", "Sarah", "Smith", "customer", "+919876543206", 42),
            ("rahul_buyer", "rahul@example.com", "Rahul", "Sharma", "customer", "+919876543207", 40),
            ("priya_buyer", "priya@example.com", "Priya", "Patel", "customer", "+919876543208", 38),
            ("amit_buyer", "amit@example.com", "Amit", "Verma", "customer", "+919876543209", 35),
        ]

        users_list = []
        for uname, email, fname, lname, role, phone, days_old in users_raw:
            u = db.query(User).filter(User.email == email).first()
            target_pwd = admin_pwd if role == "admin" or email == "shreyashtbc@gmail.com" else default_pwd
            if not u:
                u = User(
                    username=uname,
                    email=email,
                    first_name=fname,
                    last_name=lname,
                    role=role,
                    phone=phone,
                    password=target_pwd,
                    is_verified=True,
                    is_active=True,
                    created_at=now - timedelta(days=days_old)
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            else:
                u.password = target_pwd
                u.role = role
                u.is_verified = True
                u.is_active = True
                db.commit()
                db.refresh(u)
            users_list.append(u)
        print(f"✅ Users ready: {len(users_list)} users with permanent admin credentials (shreyashtbc@gmail.com / 1234567890)")

        # ----------------------------------------------------
        # 3. PRODUCTS (80 Products Total - 16 per Category)
        # ----------------------------------------------------
        products_raw = [
            # Electronics (16 items)
            ("Wireless Noise Canceling Headphones", "Electronics", 199.99, "Sony", 4.8, 10.0, "Black", "Over-Ear", "Plastic/Leather"),
            ("UltraSlim Smartwatch Series 7", "Electronics", 299.00, "Apple", 4.9, 5.0, "Space Gray", "44mm", "Aluminum"),
            ("Mechanical Gaming Keyboard RGB", "Electronics", 89.50, "Logitech", 4.6, 15.0, "Black", "Full Size", "ABS Plastic"),
            ("4K Ultra HD Curved Monitor 32\"", "Electronics", 449.99, "Samsung", 4.7, 8.0, "Silver", "32-inch", "Metal"),
            ("Portable Bluetooth Speaker Waterproof", "Electronics", 49.99, "JBL", 4.5, 20.0, "Blue", "Compact", "Rubberized"),
            ("Wireless Ergonomic Optical Mouse", "Electronics", 29.99, "Dell", 4.4, 10.0, "Black", "Medium", "Plastic"),
            ("True Wireless Earbuds ANC", "Electronics", 129.99, "Bose", 4.8, 12.0, "White", "In-Ear", "Silicone"),
            ("Fast Charging Power Bank 20000mAh", "Electronics", 39.99, "Anker", 4.7, 15.0, "Black", "Portable", "Polycarbonate"),
            ("Apple iPhone 15 Pro Max (128GB)", "Electronics", 1199.00, "Apple", 4.9, 10.0, "Natural Titanium", "6.7-inch", "Titanium"),
            ("Sony PlayStation 5 Wireless Controller", "Electronics", 69.99, "Sony", 4.8, 5.0, "White", "DualSense", "Plastic"),
            ("Apple iPad Air M2 11-inch", "Electronics", 599.00, "Apple", 4.9, 8.0, "Starlight", "11-inch", "Aluminum"),
            ("Canon EOS 200D II DSLR Camera", "Electronics", 649.00, "Canon", 4.7, 12.0, "Black", "Compact DSLR", "Polycarbonate"),
            ("Dell XPS 15 Intel Core i9 Laptop", "Electronics", 1899.00, "Dell", 4.8, 15.0, "Platinum Silver", "15.6-inch", "Aluminum/Carbon Fiber"),
            ("Noise ColorFit Pro 4 Smartwatch", "Electronics", 39.99, "Noise", 4.5, 20.0, "Jet Black", "1.72-inch", "Zinc Alloy"),
            ("boAt Airdopes 141 Bluetooth Earbuds", "Electronics", 24.99, "boAt", 4.4, 30.0, "Bold Black", "In-Ear", "ABS Plastic"),
            ("Logitech HD Webcam 1080p", "Electronics", 59.99, "Logitech", 4.6, 10.0, "Black", "Fixed Mount", "Plastic"),

            # Clothing (16 items)
            ("Classic Denim Jacket", "Clothing", 69.99, "Levi's", 4.4, 15.0, "Blue", "L", "Denim"),
            ("Cotton Casual Slim Fit Shirt", "Clothing", 34.50, "Tommy Hilfiger", 4.3, 10.0, "White", "M", "100% Cotton"),
            ("Running Sneakers Air Breathable", "Clothing", 119.00, "Nike", 4.7, 12.0, "Black/White", "10 US", "Mesh/Rubber"),
            ("Leather Crossbody Shoulder Bag", "Clothing", 85.00, "Fossil", 4.6, 18.0, "Brown", "One Size", "Genuine Leather"),
            ("Thermal Fleece Winter Hoodie", "Clothing", 45.99, "Adidas", 4.5, 25.0, "Dark Gray", "XL", "Fleece/Cotton"),
            ("Slim Fit Chino Pants", "Clothing", 49.99, "Dockers", 4.3, 10.0, "Beige", "32x32", "Cotton Blend"),
            ("Designer Polarized Sunglasses", "Clothing", 149.00, "Ray-Ban", 4.8, 5.0, "Gold/Green", "Standard", "Metal/Glass"),
            ("Sport Performance Athletic Shorts", "Clothing", 28.00, "Under Armour", 4.6, 15.0, "Navy Blue", "L", "Polyester"),
            ("Safari Unisex Waterproof Backpack 35L", "Clothing", 39.99, "Safari", 4.5, 20.0, "Black", "35 Liters", "Polyester"),
            ("Adidas Ultraboost Running Shoes", "Clothing", 179.99, "Adidas", 4.8, 10.0, "Core Black", "10.5 US", "Primeknit/Rubber"),
            ("Puma Casual Leather Sneakers", "Clothing", 64.99, "Puma", 4.4, 15.0, "Puma White", "9.5 US", "Synthetic Leather"),
            ("Women's Elegant Floral Summer Dress", "Clothing", 49.50, "Zara", 4.6, 10.0, "Floral Print", "M", "Chiffon"),
            ("Men's Leather Biker Jacket Black", "Clothing", 199.00, "H&M", 4.7, 15.0, "Black", "L", "Genuine Leather"),
            ("Premium Silk Necktie & Cufflinks Set", "Clothing", 29.99, "Raymond", 4.8, 10.0, "Burgundy", "Standard", "100% Silk"),
            ("Women's Winter Wool Trench Coat", "Clothing", 129.99, "Mango", 4.7, 12.0, "Camel", "L", "Wool Blend"),
            ("Formal Oxford Leather Shoes", "Clothing", 99.00, "Bata", 4.5, 10.0, "Dark Brown", "10 US", "Full Grain Leather"),

            # Books (16 items)
            ("The Clean Coder: Software Craftsman", "Books", 38.99, "Prentice Hall", 4.9, 5.0, "Multicolor", "Paperback", "Paper"),
            ("Design Patterns: Elements of Reusable OOP", "Books", 54.00, "Addison-Wesley", 4.8, 10.0, "Hardcover", "Hardcover", "Paper"),
            ("Atomic Habits by James Clear", "Books", 21.99, "Random House", 5.0, 15.0, "White/Yellow", "Paperback", "Paper"),
            ("Deep Work by Cal Newport", "Books", 18.50, "Grand Central", 4.7, 12.0, "Blue", "Paperback", "Paper"),
            ("System Design Interview Guide", "Books", 42.00, "Independent", 4.9, 10.0, "Black", "Paperback", "Paper"),
            ("Zero to One by Peter Thiel", "Books", 19.99, "Crown Business", 4.6, 10.0, "Yellow", "Hardcover", "Paper"),
            ("The Pragmatic Programmer 20th Ed", "Books", 49.99, "Addison-Wesley", 4.9, 8.0, "Blue", "Hardcover", "Paper"),
            ("Thinking, Fast and Slow", "Books", 16.99, "Farrar, Straus", 4.7, 15.0, "White", "Paperback", "Paper"),
            ("Psychology of Money by Morgan Housel", "Books", 18.99, "Harriman House", 4.9, 10.0, "Black/Yellow", "Paperback", "Paper"),
            ("Rich Dad Poor Dad by Robert Kiyosaki", "Books", 15.99, "Plata Publishing", 4.8, 15.0, "Purple/Gold", "Paperback", "Paper"),
            ("Clean Code: Handbook of Agile Software Craftsmanship", "Books", 44.99, "Prentice Hall", 4.9, 5.0, "Blue/White", "Paperback", "Paper"),
            ("Read People Like a Book by Patrick King", "Books", 14.50, "PK Media", 4.6, 10.0, "White", "Paperback", "Paper"),
            ("Can't Hurt Me by David Goggins", "Books", 24.99, "Lioncrest", 4.9, 10.0, "Black", "Paperback", "Paper"),
            ("Ikigai: Japanese Secret to a Long and Happy Life", "Books", 17.00, "Penguin", 4.8, 12.0, "Blue/Floral", "Hardcover", "Paper"),
            ("The Alchemist by Paulo Coelho", "Books", 12.99, "HarperOne", 4.9, 10.0, "Blue/Yellow", "Paperback", "Paper"),
            ("Start With Why by Simon Sinek", "Books", 16.50, "Portfolio", 4.7, 10.0, "White/Red", "Paperback", "Paper"),

            # Home & Garden (16 items)
            ("Stainless Steel Cookware Set 10-Piece", "Home & Garden", 159.99, "Cuisinart", 4.6, 10.0, "Silver", "10-Piece", "Stainless Steel"),
            ("Smart Robot Vacuum Cleaner WiFi", "Home & Garden", 249.99, "iRobot", 4.5, 20.0, "Black", "Standard", "Plastic"),
            ("Ergonomic Mesh Office Chair", "Home & Garden", 189.00, "Herman Miller", 4.8, 15.0, "Black", "Adjustable", "Mesh/Steel"),
            ("Aromatic Essential Oil Diffuser", "Home & Garden", 29.99, "PureMist", 4.4, 30.0, "Wood Grain", "500ml", "BPA Free Plastic"),
            ("Smart LED Desk Lamp Touch Control", "Home & Garden", 34.99, "Philips", 4.6, 12.0, "White", "Foldable", "Aluminum"),
            ("Memory Foam Orthopedic Pillow", "Home & Garden", 39.99, "SleepWell", 4.5, 15.0, "White", "Standard", "Memory Foam"),
            ("Air Fryer Max XL 5.8 Quart", "Home & Garden", 119.99, "Cosori", 4.8, 10.0, "Matte Black", "5.8 QT", "Stainless Steel"),
            ("Non-Stick Ceramic Frying Pan 10\"", "Home & Garden", 26.50, "T-fal", 4.4, 20.0, "Gray", "10-inch", "Ceramic"),
            ("Nespresso Vertuo Espresso Coffee Machine", "Home & Garden", 179.00, "Nespresso", 4.8, 10.0, "Matte Black", "54 oz", "ABS/Metal"),
            ("Stainless Steel Electric Kitchen Blender 1200W", "Home & Garden", 79.99, "Ninja", 4.7, 15.0, "Black/Silver", "72 oz", "BPA Free Triton/Steel"),
            ("Modern Ceramic Flower Vase Home Decor", "Home & Garden", 24.99, "HomeArt", 4.5, 10.0, "Matte White", "10-inch", "Ceramic"),
            ("Soft Egyptian Cotton 4-Piece Sheet Set", "Home & Garden", 59.99, "California Design", 4.7, 12.0, "Navy Blue", "Queen", "100% Cotton"),
            ("Smart Indoor Garden Herb Kit with LED", "Home & Garden", 89.99, "Click & Grow", 4.8, 10.0, "White", "3 Pods", "BPA Free Plastic"),
            ("Cast Iron Dutch Oven Pot 6 Quart", "Home & Garden", 69.99, "Lodge", 4.9, 10.0, "Enameled Red", "6 Quart", "Cast Iron"),
            ("Automatic Touchless Trash Can 13 Gallon", "Home & Garden", 54.99, "iTouchless", 4.6, 15.0, "Stainless Steel", "13 Gallon", "Stainless Steel"),
            ("High Pressure Shower Head with Filter", "Home & Garden", 28.99, "AquaBliss", 4.6, 20.0, "Chrome", "Standard", "ABS Chrome"),

            # Sports (16 items)
            ("Adjustable Dumbbell Set 50lbs", "Sports", 299.99, "Bowflex", 4.9, 10.0, "Black/Red", "Pair", "Steel/Cast Iron"),
            ("Non-Slip Yoga Mat Extra Thick", "Sports", 27.50, "Liforme", 4.6, 15.0, "Purple", "6mm", "Eco-TPE"),
            ("Pro Basketball Official Size 7", "Sports", 32.99, "Spalding", 4.7, 10.0, "Orange", "Size 7", "Composite Leather"),
            ("Insulated Stainless Water Bottle 32oz", "Sports", 24.99, "Hydro Flask", 4.9, 12.0, "Olive", "32 oz", "Stainless Steel"),
            ("Trekking Backpack 50L Waterproof", "Sports", 79.99, "Decathlon", 4.6, 15.0, "Green", "50 Liters", "Nylon"),
            ("Resistance Bands Exercise Set", "Sports", 19.99, "FitSimplify", 4.7, 20.0, "Multicolor", "5 Bands", "Latex"),
            ("Smart Jump Rope with Digital Counter", "Sports", 21.50, "Renpho", 4.5, 10.0, "Black", "Adjustable", "PVC Wire"),
            ("Badminton Racket Twin Pack with Shuttlecocks", "Sports", 45.00, "Yonex", 4.8, 8.0, "Red/Blue", "Standard", "Carbon Fiber"),
            ("Folding Electric Treadmill 2.5HP Motor", "Sports", 499.00, "NordicTrack", 4.8, 10.0, "Black", "Foldable", "Steel/ABS"),
            ("Indoor Exercise Stationary Bike", "Sports", 299.00, "Peloton", 4.7, 15.0, "Black/Red", "Adjustable", "Steel"),
            ("Premium Tennis Racket Pro 100sq", "Sports", 149.99, "Wilson", 4.8, 10.0, "Red/Black", "100 sq in", "Graphite"),
            ("Camping Tent 4-Person Waterproof Instant", "Sports", 119.99, "Coleman", 4.6, 12.0, "Green/Tan", "4-Person", "Polyester/Fiberglass"),
            ("Heavy Duty Boxing Punching Bag 80lbs", "Sports", 99.00, "Everlast", 4.7, 10.0, "Black", "80 lbs", "Synthetic Leather"),
            ("Swimming Goggles Anti-Fog UV Protection", "Sports", 18.99, "Speedo", 4.6, 15.0, "Clear/Blue", "Universal", "Silicone/Polycarbonate"),
            ("Skateboard Complete Pro 8-inch Maple", "Sports", 59.99, "Element", 4.7, 10.0, "Multicolor", "8.0 inch", "7-Ply Maple"),
            ("Football Official Match Size 5", "Sports", 29.99, "Adidas", 4.8, 10.0, "White/Black", "Size 5", "PU Leather"),
        ]

        products_list = []
        for p_item in products_raw:
            p_name, cat_name, price, brand, rating, disc, color, size, mat = p_item
            cat_obj = categories_map.get(cat_name)
            cat_id = cat_obj.id if cat_obj else 1

            img_url = PRODUCT_IMAGES.get(p_name, DEFAULT_FALLBACK_IMAGE)

            prod = db.query(Product).filter(Product.name == p_name).first()
            created_date = now - timedelta(days=random.randint(5, 60))
            if not prod:
                prod = Product(
                    name=p_name,
                    category_id=cat_id,
                    description=f"High quality {p_name} crafted for everyday use, maximum comfort, and premium performance.",
                    price=price,
                    brand=brand,
                    rating=rating,
                    discount_percentage=disc,
                    color=color,
                    size=size,
                    material=mat,
                    image_url=img_url,
                    created_at=created_date
                )
                db.add(prod)
                db.commit()
                db.refresh(prod)
            else:
                prod.image_url = img_url
                db.commit()
                db.refresh(prod)
            products_list.append(prod)

        # ----------------------------------------------------
        # 4. INVENTORY (80 Products Stock)
        # ----------------------------------------------------
        for prod in products_list:
            inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
            if not inv:
                qty = random.choice([8, 15, 24, 45, 80, 120, 200])
                inv = Inventory(
                    product_id=prod.id,
                    quantity=qty,
                    updated_at=now - timedelta(days=random.randint(1, 10))
                )
                db.add(inv)
                db.commit()

        print(f"🎉 Database Seeding Complete! {len(products_list)} Products with HD Images Ready!")

    except Exception as e:
        print(f"❌ Seeding error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
