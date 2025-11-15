# backend/Dockerfile

# 1) Use an official Node image as the base.
#    Node 22 is fine for your current stack and matches the README.
FROM node:22-alpine

# 2) Set the working directory inside the container.
WORKDIR /app

# 3) Copy only package files first to leverage Docker layer caching.
COPY package*.json ./

# 4) Install dependencies (including dev deps so Prisma CLI is available).
RUN npm ci

# 5) Copy the rest of the backend code into the image.
COPY . .

# 6) Expose the port your Fastify server listens on.
EXPOSE 3001

# 7) Start the backend in "production style".
#    (You can switch to `npm run dev` if you want hot reload in Docker.)
CMD ["npm", "start"]
