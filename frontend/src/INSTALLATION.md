# 🚨 INSTALACIÓN LIMPIA DE WORKCODILE

## ⚠️ IMPORTANTE: Sigue estos pasos EXACTAMENTE

### 1. Limpieza completa del proyecto

```bash
# Eliminar TODOS los archivos problemáticos
rm -rf supabase/
rm -rf utils/supabase/
rm -rf npmignore/
rm -rf node_modules/
rm -f package-lock.json
```

### 2. Reemplazar archivos de configuración

```bash
# Copiar los archivos limpios
cp package-clean.json package.json
cp tsconfig-clean.json tsconfig.json
cp gitignore-clean .gitignore
```

### 3. Instalación

```bash
# Limpiar caché de npm
npm cache clean --force

# Instalar dependencias
npm install

# Ejecutar el proyecto
npm run dev
```

## 🎯 Si TODAVÍA tienes errores:

### Opción A: Limpieza manual (Windows)
```cmd
rmdir /s /q supabase
rmdir /s /q utils\supabase
rmdir /s /q npmignore
rmdir /s /q node_modules
del package-lock.json
copy package-clean.json package.json
npm install
npm run dev
```

### Opción B: Proyecto completamente nuevo
1. Crea una carpeta nueva: `workcodile-clean`
2. Copia SOLO estos archivos/carpetas:
   - `App.tsx`
   - `components/` (excepto archivos de messaging)
   - `styles/`
   - `src/`
   - `index.html`
   - `package-clean.json` (renómbralo a `package.json`)
   - `tsconfig-clean.json` (renómbralo a `tsconfig.json`)
   - `tailwind.config.js`
   - `postcss.config.js`
   - `vite.config.ts`
3. Ejecuta `npm install && npm run dev`

## ✅ Lo que debería funcionar:
- Instalación sin errores de Supabase
- Proyecto corriendo en http://localhost:5173
- Todas las funcionalidades de WorkCodile funcionando localmente
- Sistema de autenticación simulado
- Posts, comentarios, votación
- Filtros por cursos y ciclos

## 🔧 Credenciales de prueba:
- Email: `ana.garcia@unam.edu.pe`
- Password: cualquier contraseña