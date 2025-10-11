# WorkCodile Foro

## Resumen del Proyecto

WorkCodile Foro es una aplicación web full-stack diseñada como una plataforma social para estudiantes de la Universidad Nacional de Moquegua (UNAM). El sistema permite a los usuarios compartir publicaciones, trabajos y servicios en un entorno que fomenta la colaboración y el intercambio de conocimientos dentro de la comunidad universitaria.

## Tabla de Contenidos

1. [Tecnologías Utilizadas](#tecnologías-utilizadas)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Prerrequisitos](#prerrequisitos)
4. [Configuración del Entorno Local](#configuración-del-entorno-local)
5. [Ejecución de Pruebas](#ejecución-de-pruebas)
6. [Arquitectura y Diseño](#arquitectura-y-diseño)

## Tecnologías Utilizadas

El proyecto está dividido en un frontend, un backend y una infraestructura de servicios containerizada.

- **Frontend:**
  - **Framework:** React 18 con TypeScript
  - **Bundler:** Vite
  - **Estilos:** Tailwind CSS con un sistema de diseño basado en shadcn/ui
  - **UI/Componentes:** Radix UI
  - **Animación:** Motion
  - **Pruebas:** Vitest, React Testing Library, JSDOM

- **Backend:**
  - **Runtime:** Node.js
  - **Framework:** Express.js
  - **Base de Datos:** MongoDB
  - **Pruebas:** Jest, Supertest

- **Infraestructura y Servicios:**
  - **Orquestación:** Docker, Docker Compose
  - **Almacenamiento de Objetos:** MinIO (compatible con S3)
  - **Servicio de Correo:** Nodemailer con Gmail

## Estructura del Proyecto

El repositorio está organizado como un monorepo con las siguientes responsabilidades:

```
/
├── backend/         # API del servidor (Node.js, Express)
│   ├── src/
│   │   ├── services/  # Lógica de negocio (correo, almacenamiento)
│   │   ├── __tests__/ # Pruebas unitarias y de integración del backend
│   │   └── server.js  # Punto de entrada y configuración del servidor
│   └── package.json
├── frontend/        # Aplicación cliente (React, Vite)
│   ├── src/
│   │   ├── components/ # Componentes de la aplicación
│   │   └── test/       # Archivos de configuración para las pruebas
│   └── package.json
├── data/            # Volumen de datos para MongoDB (ignorado por Git)
├── minio_data/      # Volumen de datos para MinIO (ignorado por Git)
├── .env             # Archivo local para credenciales (ignorado por Git)
├── .env.example     # Plantilla de variables de entorno (versionado)
└── docker-compose.yml # Define y orquesta los servicios de desarrollo
```

## Prerrequisitos

Para ejecutar este proyecto, es necesario tener instalado el siguiente software:

- Node.js (se recomienda v18 o superior)
- npm (o un gestor de paquetes compatible como Yarn o pnpm)
- Docker Engine
- Docker Compose

## Configuración del Entorno Local

Siga estos pasos para configurar y ejecutar el proyecto en su máquina.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/juancitucs/Workcodile-dev
cd WorkCodile-Foro
```

### 2. Configurar Variables de Entorno

Las credenciales y configuraciones se gestionan a través de un archivo `.env`.

1.  Cree una copia del archivo de plantilla `.env.example`:

    ```bash
    # En Linux o macOS
    cp .env.example .env

    # En Windows (CMD)
    copy .env.example .env
    ```

2.  Abra el nuevo archivo `.env` y rellene los valores. 
    **Nota de seguridad:** Para `GMAIL_APP_PASSWORD`, debe generar una **Contraseña de Aplicación** desde la configuración de seguridad de su cuenta de Google. No utilice su contraseña principal.

### 3. Flujo de Trabajo de Desarrollo (Recomendado)

Para una máxima productividad, el enfoque recomendado es ejecutar los servicios de fondo (backend, base de datos, etc.) con Docker y el servidor de desarrollo del frontend directamente en su máquina local para aprovechar el Hot-Reloading de Vite.

**a. Iniciar Servicios de Backend (Terminal 1)**

En una terminal, desde la raíz del proyecto, ejecute:

```bash
# Inicia la base de datos, el almacenamiento y el servidor de la API en segundo plano
docker-compose up --build -d
```

**b. Iniciar Aplicación Frontend (Terminal 2)**

En una **segunda terminal**, ejecute:

```bash
# 1. Navegue al directorio del frontend
cd frontend

# 2. Instale las dependencias (solo la primera vez)
npm install

# 3. Inicie el servidor de desarrollo de Vite
npm run dev
```

### 4. Acceder a los Servicios

- **Aplicación en Desarrollo:** [http://localhost:5173](http://localhost:5173)
- **API del Backend:** [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **Consola de MinIO:** [http://localhost:9001](http://localhost:9001)

### Entorno de Producción Simulado (Opcional)

El servicio `frontend` definido en `docker-compose.yml` no utiliza el servidor de desarrollo de Vite. En su lugar, crea una compilación de producción optimizada y la sirve con un servidor web Nginx. Este modo es útil para verificar la compilación final, pero **no se recomienda para el desarrollo activo** debido a la falta de recarga en caliente (HMR).

Para probarlo, asegúrese de que todos los servicios estén en ejecución (`docker-compose up -d`) y acceda a [http://localhost:8080](http://localhost:8080).

## Ejecución de Pruebas

El proyecto cuenta con suites de pruebas separadas para el frontend y el backend.

### Pruebas del Backend

Las pruebas del backend utilizan Jest para verificar la lógica de la API.

```bash
cd backend
npm install # Solo la primera vez o si cambian las dependencias
npm test
```

### Pruebas del Frontend

Las pruebas del frontend utilizan Vitest para verificar los componentes de React.

```bash
cd frontend
npm install # Solo la primera vez o si cambian las dependencias
npm test
```

## Arquitectura y Diseño

### Modelo de Datos

El sistema utiliza una base de datos NoSQL (MongoDB) con un diseño de esquema optimizado para lecturas rápidas. Las entidades principales como `users`, `posts`, y `courses` se mantienen en colecciones separadas. Sin embargo, los datos directamente relacionados con una publicación, como los comentarios y sus respuestas, se anidan dentro del propio documento de la publicación. Este enfoque de "embedding" reduce la necesidad de consultas complejas y mejora el rendimiento al renderizar una página de detalles de la publicación.

Para una descripción detallada de las colecciones y sus esquemas, consulte el archivo `mongodb-schema.json`.

### Almacenamiento de Archivos

Los archivos adjuntos de las publicaciones se gestionan a través de un servicio de almacenamiento de objetos compatible con S3, implementado localmente con MinIO. El backend procesa la subida del archivo, lo almacena en un bucket de MinIO y guarda únicamente la URL de acceso público en el documento de la publicación en MongoDB.
