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
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
# Use pip cache for faster builds, especially on Windows
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install --upgrade google-genai

# Copy all backend project files
COPY . .

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose Django default port
EXPOSE 8000

# Use entrypoint script to run migrations and start server
ENTRYPOINT ["/app/entrypoint.sh"]
