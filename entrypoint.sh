#!/bin/sh

# En producción, solo ejecutamos el backend
# El frontend ya está compilado y se sirve desde Express
echo "🔥 Iniciando la aplicación..."
exec node backend/src/index.js