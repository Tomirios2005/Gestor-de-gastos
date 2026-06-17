# ===== STAGE 1: BUILD =====
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias del frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copiar código del frontend
COPY frontend/ ./frontend/

# Compilar el frontend
RUN cd frontend && npm run build

# ===== STAGE 2: RUNTIME =====
FROM node:22-alpine

WORKDIR /app

# Instalar solo las dependencias del backend en producción
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copiar código del backend
COPY backend/ ./backend/

# Copiar los estáticos del frontend compilados desde stage 1
COPY --from=builder /app/frontend/dist ./frontend/dist

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Ejecutar el backend
CMD ["node", "backend/src/index.js"]