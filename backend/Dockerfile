# Stage 1: Builder - installs all dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Development - uses the builder stage for development
FROM builder AS development
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage 3: Production - creates a lean production image
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3001
CMD ["npm", "start"]