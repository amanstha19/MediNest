# Use Python 3.10 slim as base image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies for Python packages and OCR
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy all backend project files
COPY . .

# Expose Django default port
EXPOSE 8000

# Default command to run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
