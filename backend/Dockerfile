# Usar una imagen oficial de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "dev"]
