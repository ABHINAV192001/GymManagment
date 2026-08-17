# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for dependency caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# In Docker, API calls go through nginx reverse-proxy on the same origin
ENV VITE_USER_MANAGEMENT_URL=""
ENV VITE_WORKOUT_SERVICE_URL=""
ENV VITE_CHAT_SERVICE_URL=""

RUN npm run build

# ---------- Stage 2: Serve with nginx ----------
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built SPA
COPY --from=builder /app/dist .

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
