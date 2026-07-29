# WorkCodile Foro

Plataforma web para estudiantes de la Universidad Nacional de Moquegua (UNAM). Permite crear publicaciones, comentar, votar y compartir archivos dentro de la comunidad universitaria.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt |
| Base de datos | MongoDB |
| Almacenamiento | MinIO (S3-compatible), Backblaze B2, cPanel |
| Email | Resend |
| Infra | Docker, Docker Compose, Nginx |
| Testing | Jest + Supertest (backend), Vitest (frontend) |

## Estructura

```
/
├── backend/
│   ├── src/
│   │   ├── config/        # Variables de entorno centralizadas
│   │   ├── controllers/   # Logica de cada endpoint
│   │   ├── data/          # Datos semilla (cursos)
│   │   ├── middleware/     # Auth, validacion, errores
│   │   ├── models/        # Schemas de Mongoose
│   │   ├── routes/        # Rutas Express
│   │   ├── services/      # Logica de negocio (posts, email, storage, XP)
│   │   ├── validators/    # express-validator
│   │   └── __tests__/     # 72 tests (unit, middleware, API, integracion)
│   └── seed.js            # Crea usuario + cursos + post de ejemplo
├── frontend/
│   └── src/
│       ├── components/    # Componentes React
│       ├── data/          # Cursos (TypeScript)
│       └── test/          # Config de pruebas
├── proxy/nginx.conf       # Reverse proxy (frontend + API + MinIO)
├── docker-compose.yml     # mongodb, minio, backend, frontend, proxy
├── .env                   # Config local (no versionado)
└── .env.example           # Plantilla de variables
```

## Requisitos

- Node.js 18+
- Docker + Docker Compose
- npm (o yarn/pnpm)

## Instalacion

### 1. Clonar

```bash
git clone https://github.com/juancitucs/Workcodile-dev
cd Workcodile-dev
```

### 2. Configurar entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

Variables principales:

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `MONGO_URI` | URL de MongoDB | `mongodb://localhost:27017/workcodiledb` |
| `JWT_SECRET` | Secreto para tokens JWT | `change_this_secret` |
| `STORAGE_PROVIDER` | `minio`, `b2` o `cpanel` | `minio` |
| `MINIO_ENDPOINT` | Host de MinIO | `localhost` |
| `RESEND_API_KEY` | API key de Resend | (vacio = deshabilitado) |

### 3. Ejecutar

**Opcion A: todo con Docker (recomendado)**

```bash
docker-compose up --build
```

Acceso: `http://localhost:8000` (proxy Nginx)

**Opcion B: backend con Docker, frontend local**

Terminal 1:
```bash
docker-compose up --build mongodb minio minio-setup backend
```

Terminal 2:
```bash
cd frontend && npm install && npm run dev
```

Acceso: `http://localhost:5173`

### 4. Semilla de datos

```bash
cd backend && npm run seed
```

Crea un usuario de prueba (`test@test.com` / `123456`), 68 cursos y un post de ejemplo.

## Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Proxy Nginx | 8000 | Entrada unica (frontend + API + archivos) |
| Frontend (dev) | 5173 | Vite dev server |
| Backend API | 3001 | Express API |
| MongoDB | 27017 | Base de datos |
| MinIO | 9000/9001 | Almacenamiento + consola web |

## Pruebas

Backend:
```bash
cd backend && npm test
```

Frontend:
```bash
cd frontend && npm test
```

Lint:
```bash
cd backend && npm run lint
```

## Arquitectura MVC

El backend sigue patron MVC:

- **Models** (`models/`) -- schemas de Mongoose
- **Views** -- no aplica (API REST, JSON)
- **Controllers** (`controllers/`) -- logica HTTP
- **Services** (`services/`) -- logica de negocio separada
- **Routes** (`routes/`) -- endpoints Express
- **Validators** (`validators/`) -- express-validator
- **Middleware** (`middleware/`) -- auth, errores, validacion

## CI/CD

GitHub Actions ejecuta automaticamente en cada PR y push a main:

1. **Lint** -- ESLint en backend
2. **Tests** -- Jest con MongoDB en servicio
3. **Build** -- Compilacion del frontend con Vite
4. **Docker** -- Build de imagenes backend y frontend

Ver `.github/workflows/ci.yml`.

## Seguridad

- JWT con expiracion de 1 hora
- Passwords hasheados con bcrypt
- Rate limiting (200 req / 15 min)
- Helmet headers de seguridad
- Validacion de entrada en todos los endpoints
- Sin secrets hardcodeados (todo via `.env`)
- CORS configurado por origen

## Licencia

Proyecto privado -- Universidad Nacional de Moquegua.
