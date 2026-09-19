#!/bin/bash
# Run the FastAPI backend
# Usage: bash run.sh

cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python -m venv venv
fi

# Activate
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Run server
echo "Starting FastAPI server on http://localhost:5000"
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
