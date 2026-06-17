# 💰 Gestor de Gastos con IA

Una aplicación full-stack para gestionar transacciones financieras con inteligencia artificial integrada. Usa **Groq AI** para análisis automático de gastos y **Supabase** para autenticación y almacenamiento.

## 🌟 Características

- 🔐 **Autenticación segura** con Supabase
- 💬 **Chat con IA** (Groq) para análisis de gastos y para añadir gastos o ingresos
- 📊 **Dashboard** de transacciones
- 📝 **Gestión de transacciones** en tiempo real
- 🎨 **UI moderna** con React + TypeScript + Tailwind CSS
- 🚀 **Deploy en Docker** 

## 🛠️ Tecnologías

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **React Router** (navegación)
- **Supabase JS Client** (autenticación)

### Backend
- **Express.js** (Node.js)
- **Groq SDK** (IA)
- **Supabase** (base de datos + auth)
- **CORS** (control de acceso)

### DevOps
- **Docker** (containerización)
- **Alpine Linux** (imagen ligera)
- **Multi-stage build** (optimización)

## 📁 Estructura del Proyecto

```
.
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas principales
│   │   ├── services/     # Servicios API
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # Context API
│   │   ├── lib/          # Librerías configuradas
│   │   └── utils/        # Utilidades
│   ├── vite.config.ts
│   └── package.json
│
├── backend/               # Servidor Express
│   ├── src/
│   │   ├── routes/       # Rutas API
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── services/     # Servicios (Groq, BD)
│   │   ├── middleware/   # Middleware (auth)
│   │   ├── config/       # Configuraciones
│   │   └── index.js      # Punto de entrada
│   └── package.json
│
├── Dockerfile            # Multi-stage build
├── entryPoint.sh         # Script de entrada
└── README.md             # Este archivo
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Node.js** >= 18
- **npm** >= 9
- Variables de entorno configuradas (ver [Configuración](#-configuración))

### Desarrollo Local

#### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd "Gestor de gastos"
```

#### 2. Configurar variables de entorno
```bash
# Backend
cat > backend/.env << EOF
SUPABASE_URL=tu-url-supabase
SUPABASE_KEY=tu-anon-key
GROQ_API_KEY=tu-groq-api-key
CLIENT_URL=http://localhost:5173
EOF

# Frontend
cat > frontend/.env.local << EOF
VITE_SUPABASE_URL=tu-url-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:3000
EOF
```

#### 3. Instalar dependencias
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

#### 4. Ejecutar en desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run start
# Backend escucha en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend escucha en http://localhost:5173
```

Accede a la aplicación en: **http://localhost:5173**

---

## 🐳 Docker (Producción)

### Build
```bash
docker build -t gestor-gastos:latest .
```

### Ejecutar
```bash
docker run -p 3000:3000 \
  -e SUPABASE_URL=tu-url-supabase \
  -e SUPABASE_KEY=tu-anon-key \
  -e GROQ_API_KEY=tu-groq-api-key \
  -e CLIENT_URL=https://tu-dominio.com \
  gestor-gastos:latest
```

### Con docker-compose (recomendado)
```bash
docker-compose up -d
```

**Acceso:** http://tu-dominio.com:3000

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Anon key de Supabase | `eyJxxx...` |
| `GROQ_API_KEY` | API key de Groq | `gsk_xxx...` |
| `CLIENT_URL` | URL del frontend | `http://localhost:5173` |
| `PORT` | Puerto del servidor | `3000` (default) |

### Variables de Entorno (Frontend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJxxx...` |
| `VITE_API_URL` | URL base de la API | `http://localhost:3000` |

---

## 📡 API Endpoints

### Chat (Groq IA)
```
POST /api/chat
Content-Type: application/json

{
  "message": "¿Cuánto gaste este mes?",
  "userId": "user-uuid"
}
```

### Transacciones
```
GET    /api/transactions           # Obtener todas
POST   /api/transactions           # Crear nueva
GET    /api/transactions/:id       # Obtener una
PUT    /api/transactions/:id       # Actualizar
DELETE /api/transactions/:id       # Eliminar
```

### Health Check
```
GET /health
Respuesta: { "status": "ok" }
```

---

## 📊 Base de Datos (Supabase)

Tablas requeridas:

### `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```



---

## 🧪 Testing (Próximamente)

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

---

## 📝 Scripts Disponibles

### Backend
```bash
npm run start      # Iniciar servidor
npm run test       # Ejecutar tests
```

### Frontend
```bash
npm run dev        # Desarrollo con hot reload
npm run build      # Compilar para producción
npm run preview    # Preview de la build
npm run lint       # Verificar código
```

---

## 🔒 Seguridad

- ✅ Uso de variables de entorno (no hardcodear secrets)
- ✅ CORS configurado correctamente
- ✅ JWT tokens de Supabase
- ✅ Usuario no-root en Docker
- ✅ Dependencies sin vulnerabilidades conocidas
- ✅ Health checks habilitados

---

## 🐛 Troubleshooting

### El frontend no se muestra
- Verificar que el backend está corriendo (`http://localhost:3000`)
- Verificar `VITE_API_URL` en `.env.local`
- Limpiar caché del navegador

### Error de CORS
- Verificar `CLIENT_URL` en variables de entorno
- Verificar que los dominios coinciden

### Error de Supabase
- Verificar `SUPABASE_URL` y `SUPABASE_KEY`
- Verificar que la tabla `transactions` existe
- Verificar permisos de RLS

### Error de Groq
- Verificar que `GROQ_API_KEY` es válido
- Verificar límite de requests (free tier)

---

## 🚀 Deploy Recomendado

### Railway / Render / Fly.io
```bash
docker build -t mi-app .
# Usar el Dockerfile generado
```

### Vercel (Frontend) + AWS/Heroku (Backend)
- Deploy frontend en Vercel
- Deploy backend en servicio compatible con Node.js
- Actualizar `VITE_API_URL` y `CLIENT_URL`

---

## 📄 Licencia

ISC - © 2026 Tomás Ríos

---

## 👨‍💻 Autor

**Tomás Ríos** - [Portafolio](https://tomirios2005.github.io/ReactPortfolio/)

---

## 📞 Soporte

Para reportar problemas o sugerencias, abre un issue en el repositorio.

---

**Última actualización:** Junio 2026
