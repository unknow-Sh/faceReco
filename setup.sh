#!/bin/bash

echo "🚀 Starting FaceSnap Project Setup..."

# 1. Server Setup
echo "📦 Installing Backend dependencies..."
cd server && npm install
cd ..

# 2. Client Setup
echo "📦 Installing Frontend dependencies..."
cd client && npm install
cd ..

# 3. Python Face Service Setup (Optional/Manual)
echo "🐍 Checking Python environment for face recognition..."
if command -v python3 &>/dev/null; then
    echo "Found Python 3"
    # Note: dlib compilation can be slow, skipping auto-install to avoid blocking
    echo "💡 TIP: Run 'pip install -r face_service/requirements.txt' manually."
    echo "   You may need 'sudo apt install cmake' first."
else
    echo "❌ Python 3 not found. Please install it for face recognition."
fi

echo "✅ Basic setup complete!"
echo "------------------------------------------------"
echo "To run the project, open 3 terminals:"
echo "1. Server: cd server && npm run dev"
echo "2. Client: cd client && npm run dev"
echo "3. Face Service: cd face_service && uvicorn main:app --port 5001"
echo "------------------------------------------------"
