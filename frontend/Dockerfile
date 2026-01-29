FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Create directory structure for the base path
WORKDIR /usr/share/nginx/html
RUN mkdir -p aii/wr-management

# Copy build artifacts to the subpath directory
COPY --from=builder /app/dist ./aii/wr-management/

# Configure Nginx to listen on port 3000 and handle SPA routing
RUN echo 'server { \
    listen 3000; \
    location / { \
        return 301 /aii/wr-management/; \
    } \
    location /aii/wr-management/ { \
        alias /usr/share/nginx/html/aii/wr-management/; \
        try_files $uri $uri/ /aii/wr-management/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
