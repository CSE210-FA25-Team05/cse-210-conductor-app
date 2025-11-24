FROM node:22-alpine

# Set the working directory inside the container.
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

COPY . .

# Expose the Fastify server port
EXPOSE 3001

# Use our custom entrypoint to set up Prisma + DB then start server
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
