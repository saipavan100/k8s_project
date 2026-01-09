# Kubernetes Deployment Summary

## What You Did
Converted your Docker Compose application to **Kubernetes on Azure (AKS)** using Helm charts, with backend and frontend running as **separate microservices**.

---

## Architecture
```
Ingress (LoadBalancer IP: 20.246.186.164)
    ↓
Frontend Service (ClusterIP:3000) → Nginx Pod
    ↓
Backend Service (ClusterIP:5000) → Node.js App
    ↓
MongoDB Atlas
```

---

## Issues Encountered & Solutions

### 1. **GitHub Secret Scanning Blocked Push**
**Problem:** Real API keys in `values.yaml` triggered GitHub's push protection  
**Solution:** 
- Removed `values.yaml` from git history
- Created `values-template.yaml` (safe version with placeholders) → committed
- Created `values-prod.yaml` (real secrets locally) → added to .gitignore

### 2. **ACR Image Pull Failed (401 Unauthorized)**
**Problem:** Pods couldn't pull images from Azure Container Registry  
**Solution:**
- Created Kubernetes secret: `docker-registry acr-secret`
- Added `imagePullSecrets` to deployment specs
- Images now pull successfully

### 3. **Nginx "Host Not Found" Error**
**Problem:** Frontend and backend in same pod, nginx looking for external service called "backend"  
**Solution:**
- Separated into **2 different deployments**
- Frontend gets `BACKEND_HOST=myapp-backend:5000` environment variable
- Uses Kubernetes service DNS for discovery

### 4. **Envsubst Corrupting Config**
**Problem:** `envsubst` was substituting ALL `$variables` including nginx variables, breaking config  
**Solution:**
- Changed to: `envsubst '$BACKEND_HOST'` (only substitute this one variable)
- Kept nginx variables like `$http_upgrade`, `$host` untouched

### 5. **Nginx Not Listening (Connection Refused)**
**Problem:** Nginx was listening on port 80, but deployment expected port 3000  
**Solution:**
- Updated `nginx.conf`: changed `listen 80` → `listen 3000`
- Health checks now pass, pods become Ready ✅

---

## Final Status
✅ **myapp-backend**: 1/1 Running (MongoDB + Email + Azure OpenAI connected)  
✅ **myapp-frontend**: 1/1 Running (Nginx on port 3000)  
✅ **Ingress**: Active at `http://20.246.186.164`  
✅ **Service Discovery**: Frontend can reach backend via `myapp-backend:5000`

---

## Key Files Modified
- `win_k8s/templates/deployment-backend.yaml` - Backend microservice
- `win_k8s/templates/deployment-frontend.yaml` - Frontend microservice  
- `win_k8s/templates/service.yaml` - Two services (one per deployment)
- `frontend/Dockerfile` - Added envsubst for env var substitution
- `frontend/nginx.conf` - Changed port to 3000, added ${BACKEND_HOST} variable
- `values-template.yaml` - Safe version (committed to git)
- `values-prod.yaml` - Real secrets (local only, not in git)

---

## How to Access
```
http://20.246.186.164
```

App loads → Frontend → Calls backend via service DNS → Connected! ✅
