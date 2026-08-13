FROM node:22-bookworm-slim

# Install system dependencies required for PDF tools, Office conversion, and Python Bridge
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    libreoffice \
    qpdf \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Setup Python virtual environment and dependencies
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir pdf2docx PyMuPDF python-pptx

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Create storage directory inside the container
RUN mkdir -p storage

# Expose the API port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
