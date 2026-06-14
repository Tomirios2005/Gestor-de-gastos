#!/bin/sh

# 1. Arrancar el Frontend en segundo plano (&)
echo "🚀 Iniciando el Frontend..."
cd /app/frontend
npm run dev &    # <--- El '&' al final es CLAVE para que no bloquee la terminal

# 2. Arrancar el Backend en primer plano
echo "🔥 Iniciando el Backend..."
cd /app/backend
npm run start      # <--- Este queda corriendo en primer plano para mantener vivo el contenedor