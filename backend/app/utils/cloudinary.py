import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

def setup_cloudinary():
    # If CLOUDINARY_URL is in the environment, cloudinary auto-configures it
    # We can also manually set it if needed, but the library will pick it up
    pass

def validate_image_file(file: UploadFile) -> None:
    """Validate image file type and size."""
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: JPG, PNG, WEBP"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds 5MB limit"
        )

def upload_image(file: UploadFile, folder: str = "ecommerce/profiles") -> str:
    try:
        validate_image_file(file)
        setup_cloudinary()
        # Upload file directly via file.file (spooled temp file)
        result = cloudinary.uploader.upload(
            file.file, 
            folder=folder,
            resource_type="image"
        )
        return result.get("secure_url")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

def delete_image(public_id: str):
    try:
        setup_cloudinary()
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        import logging
        logging.error(f"Failed to delete image {public_id}: {str(e)}")
