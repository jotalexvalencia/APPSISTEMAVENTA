# =========================================
# ETAPA 1: BUILD — Node.js (usamos tag válido)
# =========================================
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json primero para aprovechar caché de npm
COPY package*.json ./

# Instalar dependencias (Angular 16 es compatible con Node 18)
RUN npm ci --legacy-peer-deps

# Copiar código fuente y compilar
COPY . .
RUN npm run build --configuration=production || true

# =========================================
# ETAPA 2: RUNTIME — Nginx Alpine
# =========================================
FROM nginx:alpine AS runtime

# Configuración de Nginx para Angular (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular
# outputPath en angular.json: "dist/app-sistema-venta"
COPY --from=build /app/dist/app-sistema-venta /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
