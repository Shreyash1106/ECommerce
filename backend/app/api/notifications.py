from fastapi import APIRouter, Depends, Path, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

router = APIRouter(tags=["Notifications"])

@router.get("")
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .offset(skip).limit(limit).all()
        )
        unread_count = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).count()
        return {
            "notifications": [NotificationResponse.model_validate(n).model_dump() for n in notifications],
            "unread_count": unread_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return {"detail": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.is_read = True
        db.commit()
        return {"detail": "Notification marked as read", "notification_id": notification_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        db.delete(notif)
        db.commit()
        return {"detail": "Notification deleted", "notification_id": notification_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
