FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN addgroup -g 1001 -S workcodile && adduser -S workcodile -u 1001 -G workcodile
RUN chown -R workcodile:workcodile /usr/share/nginx/html && \
    chown -R workcodile:workcodile /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && chown workcodile:workcodile /var/run/nginx.pid
USER workcodile
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
