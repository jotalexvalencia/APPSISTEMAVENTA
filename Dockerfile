# =========================================
# 📦 ETAPA 1: BUILD — Angular
# =========================================
FROM node:18-alpine AS build

WORKDIR /app

# 🔥 TRUCO: Copiar package*.json primero para aprovechar cache de npm
COPY package*.json ./

# Instalar dependencias (se cachea si package-lock.json no cambia)
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# ✅ Compilar en producción (SIN || true — queremos que falle si hay error)
RUN npm run build -- --configuration=production

# =========================================
# 🚀 ETAPA 2: RUNTIME — Nginx
# =========================================
FROM nginx:1.26-alpine AS runtime

# Copiar configuración personalizada de Nginx (con proxy /api)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de build
COPY --from=build /app/dist/app-sistema-venta /usr/share/nginx/html

# Nginx por defecto escucha en puerto 80
EXPOSE 80

# Comando por defecto de la imagen nginx:alpine
CMD ["nginx", "-g", "daemon off;"]
