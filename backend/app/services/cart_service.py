from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.coupon import Coupon

def calculate_cart_summary(
    db: Session,
    items: List[Dict[str, Any]],
    coupon_code: str = None,
) -> Dict[str, Any]:
    subtotal = 0.0
    verified_items = []
    
    for item in items:
        product_id = item.get("product_id") or item.get("id")
        qty = item.get("quantity", 1)
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            item_total = float(product.price) * qty
            subtotal += item_total
            verified_items.append({
                "product_id": product.id,
                "name": product.name,
                "price": float(product.price),
                "quantity": qty,
                "total": item_total,
                "image_url": product.image_url,
                "in_stock": (product.inventory.quantity >= qty) if product.inventory else True
            })

    discount = 0.0
    applied_coupon = None
    if coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == coupon_code.upper(),
            Coupon.is_active == True
        ).first()
        if coupon and subtotal >= coupon.min_order_amount:
            if coupon.discount_type == "percentage":
                discount = (subtotal * coupon.discount_value) / 100.0
                if coupon.max_discount_amount:
                    discount = min(discount, coupon.max_discount_amount)
            else:
                discount = min(coupon.discount_value, subtotal)
            applied_coupon = coupon.code

    shipping = 0.0 if subtotal >= 100.0 or subtotal == 0 else 15.0
    gst = round((subtotal - discount) * 0.18, 2) if subtotal > 0 else 0.0
    grand_total = max(0.0, round(subtotal - discount + shipping + gst, 2))

    return {
        "items": verified_items,
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "applied_coupon": applied_coupon,
        "shipping": round(shipping, 2),
        "gst": gst,
        "grand_total": grand_total,
    }
