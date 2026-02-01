"""
Image processing utilities for optimization and thumbnail generation.
"""

import base64
import io
from typing import Tuple, Optional
from PIL import Image


def decode_base64_image(base64_string: str) -> bytes:
    """
    Decode a base64 image string to bytes.
    Handles data URL prefix if present.
    """
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)


def encode_base64_image(image_bytes: bytes, media_type: str = "jpeg") -> str:
    """
    Encode image bytes to base64 data URL.
    """
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/{media_type};base64,{b64}"


def extract_image_dimensions(base64_string: str) -> Tuple[int, int]:
    """
    Extract width and height from a base64 image.
    
    Returns:
        Tuple of (width, height)
    """
    try:
        image_data = decode_base64_image(base64_string)
        with Image.open(io.BytesIO(image_data)) as img:
            return img.size
    except Exception:
        return (0, 0)


def optimize_image_base64(
    base64_string: str,
    max_size: Tuple[int, int] = (1920, 1080),
    quality: int = 85,
    format: str = "JPEG",
) -> str:
    """
    Optimize a base64 image by resizing and compressing.
    
    Args:
        base64_string: The base64 encoded image (with or without data URL prefix)
        max_size: Maximum dimensions (width, height) - maintains aspect ratio
        quality: JPEG quality (1-100)
        format: Output format (JPEG, WEBP)
    
    Returns:
        Optimized base64 image with data URL prefix
    """
    try:
        # Decode base64
        image_data = decode_base64_image(base64_string)
        
        with Image.open(io.BytesIO(image_data)) as img:
            # Convert RGBA to RGB for JPEG
            if img.mode == "RGBA" and format.upper() == "JPEG":
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != "RGB" and format.upper() == "JPEG":
                img = img.convert("RGB")
            
            # Resize if larger than max_size
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = io.BytesIO()
            img.save(
                output,
                format=format.upper(),
                quality=quality,
                optimize=True,
            )
            output.seek(0)
            
            # Encode back to base64
            media_type = "jpeg" if format.upper() == "JPEG" else format.lower()
            return encode_base64_image(output.getvalue(), media_type)
            
    except Exception as e:
        # Return original if optimization fails
        print(f"Image optimization failed: {e}")
        return base64_string


def create_thumbnail_base64(
    base64_string: str,
    size: Tuple[int, int] = (400, 400),
    quality: int = 75,
) -> str:
    """
    Create a thumbnail from a base64 image.
    
    Args:
        base64_string: The base64 encoded image
        size: Thumbnail dimensions (width, height)
        quality: JPEG quality (1-100)
    
    Returns:
        Thumbnail as base64 image with data URL prefix
    """
    try:
        image_data = decode_base64_image(base64_string)
        
        with Image.open(io.BytesIO(image_data)) as img:
            # Convert to RGB for JPEG
            if img.mode != "RGB":
                if img.mode == "RGBA":
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                else:
                    img = img.convert("RGB")
            
            # Create thumbnail (maintains aspect ratio)
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save thumbnail
            output = io.BytesIO()
            img.save(output, format="JPEG", quality=quality, optimize=True)
            output.seek(0)
            
            return encode_base64_image(output.getvalue(), "jpeg")
            
    except Exception as e:
        print(f"Thumbnail creation failed: {e}")
        return base64_string


def generate_blur_placeholder(
    base64_string: str,
    size: Tuple[int, int] = (10, 10),
) -> Optional[str]:
    """
    Generate a tiny blur placeholder image for progressive loading.
    
    Args:
        base64_string: The base64 encoded image
        size: Tiny placeholder size (default 10x10)
    
    Returns:
        Tiny base64 image for blur placeholder
    """
    try:
        image_data = decode_base64_image(base64_string)
        
        with Image.open(io.BytesIO(image_data)) as img:
            # Convert to RGB
            if img.mode != "RGB":
                img = img.convert("RGB")
            
            # Create tiny version
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save with low quality for smaller size
            output = io.BytesIO()
            img.save(output, format="JPEG", quality=20)
            output.seek(0)
            
            return encode_base64_image(output.getvalue(), "jpeg")
            
    except Exception:
        return None
