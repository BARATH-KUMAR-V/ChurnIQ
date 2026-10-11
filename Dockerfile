# ==============================================================================
# Stage 1: Build the React Dashboard
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY frontend/package*.json ./

# Clean, reproducible dependency installation
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Pass API URL at build time (optional override)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ==============================================================================
# Stage 2: Production Nginx Server
# ==============================================================================
FROM nginx:alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
