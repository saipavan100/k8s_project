# K8s & Docker Configuration Guide

## Changes Made for K8s Deployment

### 1. Backend Server Configuration (`server.js`)
**Changes:**
- ✅ CORS now accepts requests from anywhere in K8s mode
- ✅ HOST automatically sets to `0.0.0.0` for K8s (required for listening on all interfaces)
- ✅ Detects environment and adjusts configuration accordingly
- ✅ MODE indicator shows if running in development or K8s/Production

**Logic:**
```
If NODE_ENV=development:
  - CORS restricted to localhost (safe for local dev)
  - HOST=localhost
  
If NODE_ENV=production (K8s):
  - CORS accepts all origins (*)
  - HOST=0.0.0.0 (listens on all interfaces)
```

---

### 2. Backend Dockerfile
**Features:**
- Alpine Linux (smaller size ~50MB)
- Production-ready (only installs production dependencies)
- Health check endpoint for K8s
- Properly exposes port 5000

**Build command:**
```bash
docker build -t winwire-backend:latest ./backend
```

---

### 3. Frontend Dockerfile
**Features:**
- Multi-stage build (reduce final image size)
- Stage 1: Build React app
- Stage 2: Serve with Nginx (lightweight)
- Final image ~50MB
- Health check endpoint

**Build command:**
```bash
docker build -t winwire-frontend:latest ./frontend
```

---

### 4. Nginx Configuration (`nginx.conf`)
**Features:**
- SPA routing (all routes serve index.html)
- Static asset caching (30 days)
- GZIP compression enabled
- API proxy to backend (optional)
- Health check endpoint at `/health`

---

### 5. Docker Compose (`docker-compose.yml`)
**For local testing:**
```bash
docker-compose up
```

Starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`
- Both services can communicate
- Health checks enabled

---

## Building Docker Images

### Backend
```bash
cd backend
docker build -t winwire-backend:latest .
docker run -p 5000:5000 -e NODE_ENV=production winwire-backend:latest
```

### Frontend
```bash
cd frontend
docker build -t winwire-frontend:latest .
docker run -p 3000:80 winwire-frontend:latest
```

### Both Together
```bash
docker-compose up -d
```

---

## Environment Variables

### For K8s Deployment:
Set `NODE_ENV=production` to enable:
- ✅ CORS for all origins
- ✅ Host listening on 0.0.0.0
- ✅ Production mode logging

### Example K8s Deployment:
```yaml
spec:
  containers:
  - name: backend
    image: winwire-backend:latest
    ports:
    - containerPort: 5000
    env:
    - name: NODE_ENV
      value: "production"
    - name: PORT
      value: "5000"
    livenessProbe:
      httpGet:
        path: /health
        port: 5000
      initialDelaySeconds: 40
      periodSeconds: 30
```

---

## Image Sizes

| Image | Size | Notes |
|-------|------|-------|
| Backend | ~80MB | Alpine + Node modules |
| Frontend | ~50MB | Multi-stage Nginx |

Both use `.dockerignore` to exclude unnecessary files.

---

## Testing Locally

1. **With Docker Compose:**
   ```bash
   docker-compose up
   ```

2. **With Individual Containers:**
   ```bash
   # Terminal 1
   docker build -t winwire-backend ./backend
   docker run -p 5000:5000 -e NODE_ENV=production winwire-backend
   
   # Terminal 2
   docker build -t winwire-frontend ./frontend
   docker run -p 3000:80 winwire-frontend
   ```

3. **Access:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000/api`
   - Health: `http://localhost:5000/health`

---

## Push to Registry

```bash
# For Docker Hub
docker tag winwire-backend:latest yourusername/winwire-backend:latest
docker push yourusername/winwire-backend:latest

docker tag winwire-frontend:latest yourusername/winwire-frontend:latest
docker push yourusername/winwire-frontend:latest
```

---

## K8s Deployment Ready ✅

Your application is now ready for:
- Docker containerization
- Kubernetes deployment
- Cloud platforms (AWS ECS, Azure AKS, GCP GKE)
- Docker Compose for local testing
