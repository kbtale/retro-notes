FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root package files (contains workspace definitions)
COPY package*.json ./

# Copy ALL workspace package.json files
# This is required for npm to properly resolve the workspace dependency graph
COPY apps/web-app/package*.json ./apps/web-app/
COPY apps/api-server/package*.json ./apps/api-server/

# Install dependencies from root (respects workspaces, creates proper symlinks)
RUN npm install

# Copy only the web-app source code (not the entire monorepo)
COPY apps/web-app/ ./apps/web-app/

# Set working directory to the app
WORKDIR /usr/src/app/apps/web-app

# Expose Vite dev server port
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev", "--", "--host"]
