FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY apps/api-server/package*.json ./apps/api-server/

# Install dependencies from root (for workspace support)
RUN npm install

# Copy API server source
COPY apps/api-server ./apps/api-server

# Build the application
WORKDIR /usr/src/app/apps/api-server
RUN npm run build

# Expose API port
EXPOSE 3000

# Start in development mode (can be overridden in docker-compose)
CMD ["npm", "run", "start:dev"]