# Stage 1: Builder - has source code and all dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Development - for local docker-compose
FROM builder AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage 3: Production - for Render
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app .
EXPOSE 3001
CMD ["npm", "start"]
