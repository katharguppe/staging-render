# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY package-lock.json ./

# Copy auth-bff package
COPY packages/auth-bff/package*.json ./packages/auth-bff/
COPY packages/auth-bff/prisma ./packages/auth-bff/prisma/
COPY packages/auth-bff/src ./packages/auth-bff/src/
COPY packages/auth-bff/tsconfig.json ./packages/auth-bff/

# Install dependencies
RUN npm install

# Build the application
WORKDIR /app/packages/auth-bff
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files for production install
COPY package*.json ./
COPY package-lock.json ./
COPY packages/auth-bff/package*.json ./packages/auth-bff/
COPY packages/auth-bff/prisma ./packages/auth-bff/prisma/
COPY packages/auth-bff/dist ./packages/auth-bff/dist/
COPY packages/auth-bff/node_modules ./packages/auth-bff/node_modules/

WORKDIR /app/packages/auth-bff

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
