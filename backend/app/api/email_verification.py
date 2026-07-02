from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.email_service import generate_verification_token, send_verification_email, verify_token
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Email Verification"])

@router.post("/send-verification", status_code=status.HTTP_202_ACCEPTED)
def send_verification(email: str = Query(...), background_tasks: BackgroundTasks = BackgroundTasks(), db: Session = Depends(get_db)):
    """Generate a verification token and send email to the provided address."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = generate_verification_token(email)
    send_verification_email(email, token, background_tasks)
    return {"message": "Verification email sent"}

@router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    """Verify the token and activate the user account."""
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = 1
    db.commit()
    return {"message": "Email verified successfully"}
