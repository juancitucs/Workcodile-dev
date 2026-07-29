FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .

FROM builder AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=builder /app/src ./src
COPY --from=builder /app/seed.js ./
RUN addgroup -g 1001 -S workcodile && adduser -S workcodile -u 1001 -G workcodile
USER workcodile
EXPOSE 3001
CMD ["npm", "start"]
