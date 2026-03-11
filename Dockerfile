# Stage 1: Build React
FROM node:18-alpine AS frontend-builder
WORKDIR /app/mini-project
COPY mini-project/package*.json ./
RUN npm install
COPY mini-project/ ./
RUN npm run build

# Stage 2: Backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy React build from stage 1
COPY --from=frontend-builder /app/mini-project/build ./mini-project/build

# Set workspace to backend
WORKDIR /app/backend

# Expose the app port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
