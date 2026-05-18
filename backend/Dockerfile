# ============================================================
# GigFlow Backend — Multi-Stage Dockerfile
# Stage 1: Build TypeScript -> JavaScript
# Stage 2: Production runner with minimal image size
# ============================================================

# ---- Stage 1: Builder ----

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# ---- Stage 2: Production Runner ----

FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system gigflow && \
    adduser --system --ingroup gigflow gigflow

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER gigflow

# Expose the application port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
