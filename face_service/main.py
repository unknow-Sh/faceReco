from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import face_recognition
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FaceSnap Face Recognition Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ────────────────────────────────────────────────

class PhotoInput(BaseModel):
    id: str
    path: str

class EncodeRequest(BaseModel):
    photos: List[PhotoInput]

class PhotoWithEncodings(BaseModel):
    id: str
    encodings: List[List[float]]  # list of 128-d encoding vectors

class SearchRequest(BaseModel):
    selfie_path: str
    photos: List[PhotoWithEncodings]

# ─── Helpers ────────────────────────────────────────────────

def load_and_encode(image_path: str):
    """Load image and return all face encodings found."""
    try:
        image = face_recognition.load_image_file(image_path)
        # Use hog for speed, cnn for better accuracy (requires GPU)
        locations = face_recognition.face_locations(image, model="hog")
        encodings = face_recognition.face_encodings(image, locations)
        return encodings, len(locations)
    except Exception as e:
        logger.error(f"Failed to encode {image_path}: {e}")
        return [], 0

# ─── Routes ─────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "FaceSnap Face Recognition"}

@app.post("/encode")
async def encode_photos(request: EncodeRequest):
    """Encode faces in a batch of photos."""
    results = []
    for photo in request.photos:
        if not os.path.exists(photo.path):
            logger.warning(f"Photo not found: {photo.path}")
            results.append({"id": photo.id, "encodings": [], "face_count": 0, "error": "File not found"})
            continue
        try:
            encodings, face_count = load_and_encode(photo.path)
            results.append({
                "id": photo.id,
                "encodings": [enc.tolist() for enc in encodings],
                "face_count": face_count,
                "error": None,
            })
            logger.info(f"Encoded photo {photo.id}: {face_count} face(s) found")
        except Exception as e:
            logger.error(f"Error encoding {photo.id}: {e}")
            results.append({"id": photo.id, "encodings": [], "face_count": 0, "error": str(e)})
    return {"results": results}

@app.post("/search")
async def search_face(request: SearchRequest):
    """Find all photos that contain a matching face from the selfie."""
    if not os.path.exists(request.selfie_path):
        raise HTTPException(status_code=400, detail="Selfie file not found")

    # Encode the selfie
    selfie_encodings, selfie_count = load_and_encode(request.selfie_path)
    if len(selfie_encodings) == 0:
        raise HTTPException(status_code=400, detail="No face detected in the selfie. Please use a clear, front-facing photo.")

    logger.info(f"Searching with {len(selfie_encodings)} selfie face(s) against {len(request.photos)} photos")

    matched_ids = []
    TOLERANCE = 0.5  # Lower = stricter matching (0.4 very strict, 0.6 lenient)

    for photo in request.photos:
        if not photo.encodings:
            continue
        photo_encodings = [np.array(enc) for enc in photo.encodings]

        # Check if any selfie face matches any face in this photo
        match_found = False
        for selfie_enc in selfie_encodings:
            distances = face_recognition.face_distance(photo_encodings, selfie_enc)
            if any(distances <= TOLERANCE):
                match_found = True
                break

        if match_found:
            matched_ids.append(photo.id)

    logger.info(f"Found {len(matched_ids)} matching photos")
    return {"matched_ids": matched_ids, "selfie_faces": selfie_count, "searched": len(request.photos)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)
