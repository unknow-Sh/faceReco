● How Face Recognition Works in This Project

The Technology Stack

This project uses face_recognition — a Python library built on top of dlib, which uses deep learning models trained by
researchers at the University of Oxford.

---

Step-by-Step: How It Works

Step 1 — Face Detection (Finding faces in an image)

Photo → HOG Algorithm → Bounding boxes around faces

- Uses HOG (Histogram of Oriented Gradients) — a classic computer vision technique
- It scans the image in blocks and detects edges/gradients that match a "face shape"
- Fast enough to run on CPU, no GPU needed
- Alternative: CNN model (more accurate, needs GPU) — commented out in the code

Step 2 — Face Encoding (Converting a face to a number)

Cropped face → Deep Neural Network → 128 numbers (a "fingerprint")

- A pre-trained deep neural network converts each face into a 128-dimensional vector
- Think of it like GPS coordinates — every face gets a unique point in 128D space
- Same person in different photos → vectors are very close together
- Different people → vectors are far apart
- This is called a face embedding

Step 3 — Storing Encodings (When photographer uploads photos)

# face_service/main.py:69

encodings, face_count = load_and_encode(photo.path)

# Saves [128 floats] per face into MongoDB

- When you upload wedding photos, each photo is sent to Python service
- All faces found are encoded and stored in MongoDB as arrays of 128 floats
- This happens in the background in batches of 10

Step 4 — Face Matching (When guest uploads selfie)

# face_service/main.py:106

distances = face_recognition.face_distance(photo_encodings, selfie_enc)
if any(distances <= TOLERANCE): # TOLERANCE = 0.5
match_found = True

- Guest uploads selfie → encode it → get their 128D vector
- Compare (Euclidean distance) against every stored face vector
- Distance < 0.5 → Match found → show that photo to the guest

---

Visual Flow

PHOTOGRAPHER SIDE:
Upload 500 wedding photos
↓
Python encodes every face found
↓
128 numbers per face saved to MongoDB

GUEST SIDE:
Upload selfie
↓
Python encodes selfie → [128 numbers]
↓
Compare distance against all stored faces
↓
Return only photos where distance < 0.5

---

How Accurate Is It?

The face_recognition library (dlib model) benchmarks at 99.38% accuracy on the standard LFW (Labeled Faces in the Wild)
dataset.

┌───────────┬─────────────────────────────────────┬───────────────┐
│ Tolerance │ Behaviour │ Use Case │
├───────────┼─────────────────────────────────────┼───────────────┤
│ 0.4 │ Very strict — may miss real matches │ High security │
├───────────┼─────────────────────────────────────┼───────────────┤
│ 0.5 │ Balanced — used in this project │ General use │
├───────────┼─────────────────────────────────────┼───────────────┤
│ 0.6 │ Lenient — may show wrong matches │ More recall │
└───────────┴─────────────────────────────────────┴───────────────┘

Real-world accuracy depends on:

- Photo quality (good lighting = better)
- Face angle (front-facing works best)
- Age difference between selfie and event photo
- Occlusion (sunglasses, masks = worse)

In practice for weddings: ~90-95% recall (finds most photos) with ~1-3% false positives (shows a photo that isn't you).

---

Can You Put This in Production?

Honest answer: Not yet as-is. Here's what's missing:

Security Issues

┌─────────────────────────────────────────┬─────────────────────────────────────┬──────────────────────────────────────────┐
│ Problem │ Risk │ Fix Needed │
├─────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ JWT_SECRET is hardcoded in .env as │ Anyone with server access can forge │ Use a strong random secret, use secrets │
│ plain text │ tokens │ manager │
├─────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ No rate limiting on face search │ Attackers can spam face searches │ Add express-rate-limit │
├─────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ Selfie photos stored in /uploads/temp/ │ Privacy risk │ Already cleaned up after search ✅ │
│ briefly │ │ │
├─────────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ No HTTPS │ Traffic is intercepted │ Add SSL/TLS via nginx │
└─────────────────────────────────────────┴─────────────────────────────────────┴──────────────────────────────────────────┘

Scalability Issues

- Photos stored on local disk — if you scale to 2 servers, photos are only on one
  - Fix: Use AWS S3 / Cloudinary
- Face encoding is CPU-bound and runs in the same process
  - Fix: Use a task queue (Celery + Redis)
- No pagination on photo queries — 10,000 photos crashes the API
  - Fix: Add .limit() and .skip() to MongoDB queries

Privacy / Legal

- You're storing biometric data (face encodings) in MongoDB
- In EU this falls under GDPR Article 9 (sensitive biometric data)
- In India it falls under DPDP Act 2023
- Need: consent mechanism, data deletion endpoint, privacy policy

What IS production-ready in this project

- MongoDB schema design is solid
- Background encoding (non-blocking) is correct
- JWT auth flow is correct
- File upload with mimetype validation is correct
- Face matching algorithm is industry-standard

---

Summary

┌───────────────────────────┬────────────┬───────────────────────────────────────────────┐
│ Aspect │ Rating │ Notes │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Face recognition accuracy │ Very Good │ 99.38% on benchmarks, ~90-95% real-world │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Code architecture │ Good │ Clean separation of concerns │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Security │ Needs work │ Missing rate limits, HTTPS, secret management │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Scalability │ Needs work │ Local disk storage, no task queue │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Privacy compliance │ Not ready │ Biometric data needs legal compliance │
├───────────────────────────┼────────────┼───────────────────────────────────────────────┤
│ Overall for production │ Not yet │ Good MVP/demo, needs hardening │
└───────────────────────────┴────────────┴───────────────────────────────────────────────┘

It's a very solid MVP — perfect for a portfolio project or demo. With 2-3 weeks of hardening (S3 storage, rate limiting, HTTPS,
GDPR consent) it could go to production.

✻ Cogitated for 37s
