# Multi-stage build for NestJS backend
FROM node:18-bullseye-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-bullseye-slim AS production

# Install dumb-init and curl for health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -g 1001 nodejs && useradd -m -u 1001 -g 1001 nestjs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and health check script
COPY prisma ./prisma/
COPY health-check.js ./

# Change ownership to app user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node health-check.js || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
