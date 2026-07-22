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

def seed_database():
    print("🌱 Starting Expanded Database Seeding (20+ Users, 40 Products, 50+ Orders with Varied Timestamps)...")
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
        print(f"✅ Categories ready: {len(categories_map)}")

        # ----------------------------------------------------
        # 2. USERS (20 Users)
        # ----------------------------------------------------
        default_pwd = get_password_hash("Password@123")
        
        users_raw = [
            ("admin_user", "admin@example.com", "System", "Admin", "admin", "+919876543200", 60),
            ("tech_vendor", "vendor1@example.com", "Alex", "Vendor", "vendor", "+919876543201", 55),
            ("style_vendor", "vendor2@example.com", "Sophia", "Vendor", "vendor", "+919876543202", 52),
            ("gear_vendor", "vendor3@example.com", "David", "Vendor", "vendor", "+919876543203", 50),
            
            ("john_buyer", "john@example.com", "John", "Doe", "customer", "+919876543204", 45),
            ("sarah_buyer", "sarah@example.com", "Sarah", "Smith", "customer", "+919876543205", 42),
            ("rahul_buyer", "rahul@example.com", "Rahul", "Sharma", "customer", "+919876543206", 40),
            ("priya_buyer", "priya@example.com", "Priya", "Patel", "customer", "+919876543207", 38),
            ("amit_buyer", "amit@example.com", "Amit", "Verma", "customer", "+919876543208", 35),
            ("neha_buyer", "neha@example.com", "Neha", "Gupta", "customer", "+919876543209", 32),
            
            ("vikram_buyer", "vikram@example.com", "Vikram", "Singh", "customer", "+919876543210", 30),
            ("ananya_buyer", "ananya@example.com", "Ananya", "Rao", "customer", "+919876543211", 28),
            ("rohan_buyer", "rohan@example.com", "Rohan", "Deshmukh", "customer", "+919876543212", 25),
            ("pooja_buyer", "pooja@example.com", "Pooja", "Joshi", "customer", "+919876543213", 22),
            ("karan_buyer", "karan@example.com", "Karan", "Mehta", "customer", "+919876543214", 20),
            
            ("sneha_buyer", "sneha@example.com", "Sneha", "Kulkarni", "customer", "+919876543215", 18),
            ("aditya_buyer", "aditya@example.com", "Aditya", "Nair", "customer", "+919876543216", 15),
            ("kavya_buyer", "kavya@example.com", "Kavya", "Reddy", "customer", "+919876543217", 12),
            ("siddharth_buyer", "siddharth@example.com", "Siddharth", "Bhat", "customer", "+919876543218", 10),
            ("riya_buyer", "riya@example.com", "Riya", "Sen", "customer", "+919876543219", 5),
        ]

        users_list = []
        for uname, email, fname, lname, role, phone, days_old in users_raw:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    username=uname,
                    email=email,
                    first_name=fname,
                    last_name=lname,
                    role=role,
                    phone=phone,
                    password=default_pwd,
                    is_verified=True,
                    is_active=True,
                    created_at=now - timedelta(days=days_old)
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            users_list.append(u)
        print(f"✅ Users seeded: {len(users_list)} total users")

        customers = [u for u in users_list if u.role == "customer"]

        # ----------------------------------------------------
        # 3. PRODUCTS (40 Products Total)
        # ----------------------------------------------------
        products_raw = [
            # Electronics (8 items)
            ("Wireless Noise Canceling Headphones", "Electronics", 199.99, "Sony", 4.8, 10.0, "Black", "Over-Ear", "Plastic/Leather"),
            ("UltraSlim Smartwatch Series 7", "Electronics", 299.00, "Apple", 4.9, 5.0, "Space Gray", "44mm", "Aluminum"),
            ("Mechanical Gaming Keyboard RGB", "Electronics", 89.50, "Logitech", 4.6, 15.0, "Black", "Full Size", "ABS Plastic"),
            ("4K Ultra HD Curved Monitor 32\"", "Electronics", 449.99, "Samsung", 4.7, 8.0, "Silver", "32-inch", "Metal"),
            ("Portable Bluetooth Speaker Waterproof", "Electronics", 49.99, "JBL", 4.5, 20.0, "Blue", "Compact", "Rubberized"),
            ("Wireless Ergonomic Optical Mouse", "Electronics", 29.99, "Dell", 4.4, 10.0, "Black", "Medium", "Plastic"),
            ("True Wireless Earbuds ANC", "Electronics", 129.99, "Bose", 4.8, 12.0, "White", "In-Ear", "Silicone"),
            ("Fast Charging Power Bank 20000mAh", "Electronics", 39.99, "Anker", 4.7, 15.0, "Black", "Portable", "Polycarbonate"),

            # Clothing (8 items)
            ("Classic Denim Jacket", "Clothing", 69.99, "Levi's", 4.4, 15.0, "Blue", "L", "Denim"),
            ("Cotton Casual Slim Fit Shirt", "Clothing", 34.50, "Tommy Hilfiger", 4.3, 10.0, "White", "M", "100% Cotton"),
            ("Running Sneakers Air Breathable", "Clothing", 119.00, "Nike", 4.7, 12.0, "Black/White", "10 US", "Mesh/Rubber"),
            ("Leather Crossbody Shoulder Bag", "Clothing", 85.00, "Fossil", 4.6, 18.0, "Brown", "One Size", "Genuine Leather"),
            ("Thermal Fleece Winter Hoodie", "Clothing", 45.99, "Adidas", 4.5, 25.0, "Dark Gray", "XL", "Fleece/Cotton"),
            ("Slim Fit Chino Pants", "Clothing", 49.99, "Dockers", 4.3, 10.0, "Beige", "32x32", "Cotton Blend"),
            ("Designer Polarized Sunglasses", "Clothing", 149.00, "Ray-Ban", 4.8, 5.0, "Gold/Green", "Standard", "Metal/Glass"),
            ("Sport Performance Athletic Shorts", "Clothing", 28.00, "Under Armour", 4.6, 15.0, "Navy Blue", "L", "Polyester"),

            # Books (8 items)
            ("The Clean Coder: Software Craftsman", "Books", 38.99, "Prentice Hall", 4.9, 5.0, "Multicolor", "Paperback", "Paper"),
            ("Design Patterns: Elements of Reusable OOP", "Books", 54.00, "Addison-Wesley", 4.8, 10.0, "Hardcover", "Hardcover", "Paper"),
            ("Atomic Habits by James Clear", "Books", 21.99, "Random House", 5.0, 15.0, "White/Yellow", "Paperback", "Paper"),
            ("Deep Work by Cal Newport", "Books", 18.50, "Grand Central", 4.7, 12.0, "Blue", "Paperback", "Paper"),
            ("System Design Interview Guide", "Books", 42.00, "Independent", 4.9, 10.0, "Black", "Paperback", "Paper"),
            ("Zero to One by Peter Thiel", "Books", 19.99, "Crown Business", 4.6, 10.0, "Yellow", "Hardcover", "Paper"),
            ("The Pragmatic Programmer 20th Ed", "Books", 49.99, "Addison-Wesley", 4.9, 8.0, "Blue", "Hardcover", "Paper"),
            ("Thinking, Fast and Slow", "Books", 16.99, "Farrar, Straus", 4.7, 15.0, "White", "Paperback", "Paper"),

            # Home & Garden (8 items)
            ("Stainless Steel Cookware Set 10-Piece", "Home & Garden", 159.99, "Cuisinart", 4.6, 10.0, "Silver", "10-Piece", "Stainless Steel"),
            ("Smart Robot Vacuum Cleaner WiFi", "Home & Garden", 249.99, "iRobot", 4.5, 20.0, "Black", "Standard", "Plastic"),
            ("Ergonomic Mesh Office Chair", "Home & Garden", 189.00, "Herman Miller", 4.8, 15.0, "Black", "Adjustable", "Mesh/Steel"),
            ("Aromatic Essential Oil Diffuser", "Home & Garden", 29.99, "PureMist", 4.4, 30.0, "Wood Grain", "500ml", "BPA Free Plastic"),
            ("Smart LED Desk Lamp Touch Control", "Home & Garden", 34.99, "Philips", 4.6, 12.0, "White", "Foldable", "Aluminum"),
            ("Memory Foam Orthopedic Pillow", "Home & Garden", 39.99, "SleepWell", 4.5, 15.0, "White", "Standard", "Memory Foam"),
            ("Air Fryer Max XL 5.8 Quart", "Home & Garden", 119.99, "Cosori", 4.8, 10.0, "Matte Black", "5.8 QT", "Stainless Steel"),
            ("Non-Stick Ceramic Frying Pan 10\"", "Home & Garden", 26.50, "T-fal", 4.4, 20.0, "Gray", "10-inch", "Ceramic"),

            # Sports (8 items)
            ("Adjustable Dumbbell Set 50lbs", "Sports", 299.99, "Bowflex", 4.9, 10.0, "Black/Red", "Pair", "Steel/Cast Iron"),
            ("Non-Slip Yoga Mat Extra Thick", "Sports", 27.50, "Liforme", 4.6, 15.0, "Purple", "6mm", "Eco-TPE"),
            ("Pro Basketball Official Size 7", "Sports", 32.99, "Spalding", 4.7, 10.0, "Orange", "Size 7", "Composite Leather"),
            ("Insulated Stainless Water Bottle 32oz", "Sports", 24.99, "Hydro Flask", 4.9, 12.0, "Olive", "32 oz", "Stainless Steel"),
            ("Trekking Backpack 50L Waterproof", "Sports", 79.99, "Decathlon", 4.6, 15.0, "Green", "50 Liters", "Nylon"),
            ("Resistance Bands Exercise Set", "Sports", 19.99, "FitSimplify", 4.7, 20.0, "Multicolor", "5 Bands", "Latex"),
            ("Smart Jump Rope with Digital Counter", "Sports", 21.50, "Renpho", 4.5, 10.0, "Black", "Adjustable", "PVC Wire"),
            ("Badminton Racket Twin Pack with Shuttlecocks", "Sports", 45.00, "Yonex", 4.8, 8.0, "Red/Blue", "Standard", "Carbon Fiber"),
        ]

        products_list = []
        for p_item in products_raw:
            p_name, cat_name, price, brand, rating, disc, color, size, mat = p_item
            cat_obj = categories_map.get(cat_name)
            cat_id = cat_obj.id if cat_obj else 1

            prod = db.query(Product).filter(Product.name == p_name).first()
            created_date = now - timedelta(days=random.randint(15, 60))
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
                    image_url=f"https://images.unsplash.com/photo-{random.randint(1500000000000, 1600000000000)}?auto=format&fit=crop&w=600&q=80",
                    created_at=created_date
                )
                db.add(prod)
                db.commit()
                db.refresh(prod)
            products_list.append(prod)
        print(f"✅ Products ready: {len(products_list)} total products")

        # ----------------------------------------------------
        # 4. INVENTORY (40 Products Stock)
        # ----------------------------------------------------
        for prod in products_list:
            inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
            if not inv:
                qty = random.choice([4, 9, 18, 30, 50, 90, 150])
                inv = Inventory(
                    product_id=prod.id,
                    quantity=qty,
                    low_stock_threshold=10,
                    created_at=prod.created_at
                )
                db.add(inv)
                db.commit()
        print("✅ Inventory seeded for all 40 products")

        # ----------------------------------------------------
        # 5. ADDRESSES (20 Addresses)
        # ----------------------------------------------------
        cities = [
            ("Mumbai", "Maharashtra", "400001"),
            ("Pune", "Maharashtra", "411004"),
            ("New Delhi", "Delhi", "110001"),
            ("Bangalore", "Karnataka", "560001"),
            ("Hyderabad", "Telangana", "500001"),
            ("Chennai", "Tamil Nadu", "600001"),
            ("Kolkata", "West Bengal", "700001"),
            ("Ahmedabad", "Gujarat", "380001"),
            ("Jaipur", "Rajasthan", "302001"),
        ]

        addresses_count = 0
        for cust in customers:
            # Each customer gets 1 to 2 saved addresses
            for a_idx in range(random.randint(1, 2)):
                city_info = random.choice(cities)
                line1_str = f"{random.randint(10, 999)} Main Street, Block {random.choice(['A','B','C','D'])}"
                line2_str = f"Apt {random.randint(101, 808)}"
                is_def = (a_idx == 0)

                existing = db.query(Address).filter(Address.user_id == cust.id, Address.line1 == line1_str).first()
                if not existing:
                    addr = Address(
                        user_id=cust.id,
                        line1=line1_str,
                        line2=line2_str,
                        city=city_info[0],
                        state=city_info[1],
                        zip_code=city_info[2],
                        country="India",
                        phone_number=cust.phone,
                        is_default=is_def
                    )
                    db.add(addr)
                    addresses_count += 1
        db.commit()
        print(f"✅ User addresses ready: {addresses_count} addresses")

        # ----------------------------------------------------
        # 6. ORDERS (50 Orders with Varied Dates & Times)
        # ----------------------------------------------------
        statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

        # Clear existing test orders for clean timestamp distribution
        db.query(Order).delete()
        db.commit()

        orders_count = 0
        for i in range(50):
            days_ago = random.randint(0, 58)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            order_time = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

            cust = random.choice(customers)
            prod = random.choice(products_list)
            qty = random.randint(1, 3)
            tot_price = round(prod.price * qty, 2)
            st = random.choice(statuses)

            new_order = Order(
                user_id=cust.id,
                product_id=prod.id,
                quantity=qty,
                total_price=tot_price,
                status=st,
                created_at=order_time
            )
            db.add(new_order)
            orders_count += 1
        db.commit()
        print(f"✅ Orders seeded: {orders_count} orders created with timestamps across past 60 days!")

        # ----------------------------------------------------
        # 7. NOTIFICATIONS (30 Notifications)
        # ----------------------------------------------------
        notif_templates = [
            ("Order Placed", "Your order #{i} has been placed successfully.", "order"),
            ("Order Shipped", "Your package #{i} has been shipped via Express Delivery.", "order"),
            ("Order Delivered", "Your package #{i} has been delivered.", "order"),
            ("Low Stock Alert", "Item '{prod}' is running low on stock.", "stock"),
            ("System Update", "Welcome to the new E-Commerce platform update!", "system"),
            ("Security Notice", "Your password was recently verified.", "security"),
        ]

        db.query(Notification).delete()
        db.commit()

        notif_count = 0
        for i in range(30):
            days_ago = random.randint(0, 45)
            hours_ago = random.randint(0, 23)
            n_time = now - timedelta(days=days_ago, hours=hours_ago)

            u = random.choice(users_list)
            p = random.choice(products_list)
            tmpl = random.choice(notif_templates)
            
            notif = Notification(
                user_id=u.id,
                title=tmpl[0],
                message=tmpl[1].format(i=1000 + i, prod=p.name),
                type=tmpl[2],
                is_read=random.choice([True, False]),
                created_at=n_time
            )
            db.add(notif)
            notif_count += 1
        db.commit()
        print(f"✅ Notifications seeded: {notif_count}")

        print("\n🎉 EXPANDED DATABASE SEEDING COMPLETED SUCCESSFULLY!")

    except Exception as e:
        print(f"❌ Seeding Failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
