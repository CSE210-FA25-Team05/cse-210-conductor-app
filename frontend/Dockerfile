# Stage 1: Install Node Modules
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Stage 2: NGINX
FROM nginx:1.29.3
COPY ./ /usr/share/nginx/html
COPY --from=builder /app/node_modules /usr/share/nginx/html/node_modules
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
