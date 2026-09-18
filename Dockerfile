# Frontend Dockerfile for SvelteKit application
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm@11.22.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG PUBLIC_API_BASE=https://explorer-apps.up.railway.app
ENV PUBLIC_API_BASE=$PUBLIC_API_BASE

ARG PUBLIC_ENABLE_ANALYTICS=true
ENV PUBLIC_ENABLE_ANALYTICS=$PUBLIC_ENABLE_ANALYTICS

# Generate sitemap before build
RUN node scripts/generate-sitemap.js

# Build the application
RUN pnpm build

# Clean up dev dependencies and install only production deps
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

# Railway sets PORT environment variable
ENV PORT=3000

# Expose port
EXPOSE $PORT

# Start the application
CMD ["node", "build/index.js"]
