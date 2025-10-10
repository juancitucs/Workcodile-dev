# ETAPA 1: Construcción de la aplicación de React
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# ETAPA 2: Servir la aplicación con Nginx
FROM nginx:stable-alpine

# Copiar los archivos de build de la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
