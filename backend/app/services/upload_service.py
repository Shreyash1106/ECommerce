import os
import logging
from pathlib import Path
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(filename: str, file_size: int) -> dict:
    """Validate file before upload."""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty"
        )
    
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit"
        )
    
    return {"filename": filename, "size": file_size}

def ensure_upload_directory() -> Path:
    """Ensure uploads directory exists with proper permissions."""
    try:
        upload_dir = Path(os.getcwd()) / "uploads"
        upload_dir.mkdir(exist_ok=True, mode=0o755)
        return upload_dir
    except OSError as e:
        logger.exception(f"Failed to create uploads directory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create upload directory"
        )

def save_file(file_path: Path, file_content: bytes) -> bool:
    """Save file to disk safely."""
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
        return True
    except IOError as e:
        logger.exception(f"Failed to save file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    except Exception as e:
        logger.exception(f"Unexpected error saving file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error during file upload"
        )
