# Frontend Dockerfile - Multi-stage build for K8s
# Stage 1: Build
FROM node:24-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variable
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine

# Copy nginx config as template (will be processed at runtime)
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port (documentation)
EXPOSE 80

# Install envsubst (gettext) to substitute environment variables
RUN apk add --no-cache gettext

# Health check for K8s
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx with environment variable substitution (only BACKEND_HOST)
CMD ["sh", "-c", "envsubst '$BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
