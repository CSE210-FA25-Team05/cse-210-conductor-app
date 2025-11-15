# Use official Node 22 image for frontend build + dev
FROM node:22-alpine

# Set work directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server in Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
