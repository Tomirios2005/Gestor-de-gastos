# Usamos una versión estable y liviana de Node.js
FROM node:22-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# === 1. CONFIGURACIÓN DEL BACKEND ===
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/

# === 2. CONFIGURACIÓN DEL FRONTEND ===
COPY frontend/package*.json ./frontend/
# Usamos ci para instalar de forma limpia y exacta las dependencias
RUN cd frontend && npm ci
COPY frontend/ ./frontend/

# AQUÍ COMPILAMOS (No iniciamos el servidor dev, generamos los estáticos)
RUN cd frontend && npm run build

# === 3. PUERTOS Y EJECUCIÓN ===
# Exponemos solo el puerto de Node (el 3000 o el que use tu backend)
EXPOSE 3000

# Mandamos a ejecutar el backend directamente
CMD ["node", "backend/src/index.js"]