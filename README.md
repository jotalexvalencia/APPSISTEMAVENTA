# Sistema de Ventas — Frontend Angular 16

> Aplicación Angular 16 para gestión de ventas, containerizada con Docker + Nginx. Diseñada para consumir la API .NET 10 con autenticación JWT, routing SPA optimizado y build reproducible.

[![Angular 16](https://img.shields.io/badge/Angular-16-red)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-✅-2496ED)](https://www.docker.com)
[![Docker Image](https://img.shields.io/docker/v/alexjuniortupapa/sistemaventa-frontend?label=Docker%20Hub&color=0db7ed)](https://hub.docker.com/r/alexjuniortupapa/sistemaventa-frontend)
[![Nginx](https://img.shields.io/badge/Nginx-1.26_Alpine-009639)](https://nginx.org)

---

## 📖 Descripción

Frontend SPA (Single Page Application) para un sistema de ventas empresarial. Proporciona interfaz para autenticación, dashboard, gestión de usuarios, productos, registro de ventas y reportes. Construida con Angular 16, Material Design y preparada para despliegue consistente con Docker.

**Características principales:**
- ✅ Routing SPA con guards de autenticación (JWT)
- ✅ Interceptor HTTP para inyección automática de tokens
- ✅ Formularios reactivos con validación en tiempo real
- ✅ Tablas paginadas + filtros + exportación a Excel
- ✅ Diseño responsive con Angular Material + FlexLayout
- ✅ Docker multi-stage: Node 18 Alpine para build + Nginx 1.26 Alpine para runtime (~65MB final)
- ✅ Nginx proxy `/api` para evitar CORS y comunicación segura con backend

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | Angular | 16.1.4 |
| **Lenguaje** | TypeScript | 5.x |
| **UI Library** | Angular Material + CDK | 16.x |
| **HTTP Client** | @angular/common/http + Interceptor | - |
| **State Management** | Services + RxJS (BehaviorSubject) | - |
| **Build Tool** | Angular CLI + Webpack | 16.x |
| **Testing** | Karma + Jasmine (unit) | - |
| **Containerización** | Docker multi-stage + Nginx 1.26 Alpine | - |

---

## 🚀 Endpoints Consumidos (API .NET 10)

| Servicio | Método | Endpoint | Propósito |
|----------|--------|----------|-----------|
| `AuthService` | POST | `/api/Usuario/IniciarSesion` | Login + obtención de tokens |
| `AuthService` | POST | `/api/Usuario/RenovarToken` | Refresh de tokens expirados |
| `UsuarioService` | GET | `/api/Usuario/Lista` | Listar usuarios (Admin) |
| `ProductoService` | GET | `/api/Producto/Lista` | Listar productos con stock |
| `VentaService` | POST | `/api/Venta/Registrar` | Registrar nueva venta |
| `VentaService` | GET | `/api/Venta/Reporte` | Reporte de ventas por rango |

> 🔗 **Nota**: La URL base de la API se configura en `src/environments/environment.ts`. Ver sección "Configuración de API URL" más abajo.

---

## ⚙️ Instalación y Ejecución

### Opción A: Desarrollo local (sin Docker)

```powershell
# 1. Clonar repositorio
git clone https://github.com/jotalexvalencia/AppSistemaVenta.git
cd AppSistemaVenta

# 2. Instalar dependencias
npm ci

# 3. Configurar endpoint de API
# Editar src/environments/environment.ts:
export const environment = {
  production: false,
  endpoint: "http://localhost:8080/api/"  # API corriendo en host
};

# 4. Iniciar servidor de desarrollo con hot-reload
ng serve

# 5. Acceder a la aplicación
# Navegar a: http://localhost:4200
```

### Opción B: Docker (Recomendado — Entorno reproducible)

```powershell
# 1. Desde raíz del proyecto (MVCCOREANGULAR/)
cd D:\02-tic\repos\MVCCOREANGULAR

# 2. Levantar stack completo
docker-compose up -d

# 3. Acceder a la aplicación
# Navegar a: http://localhost:4200

# 4. Ver logs si hay error
docker-compose logs frontend
```

### Configuración de API URL (CRÍTICO)

| Escenario | Valor en `environment.ts` | Explicación |
|-----------|--------------------------|-------------|
| **Docker Compose (full stack)** | `endpoint: "/api/"` | ✅ Nginx proxy redirige `/api/*` → `api:8080/api/*` |
| **Frontend en Docker, API en host** | `endpoint: "http://host.docker.internal:8080/api/"` | `host.docker.internal` apunta a la máquina host desde Docker |
| **Ambos en host (dev local)** | `endpoint: "http://localhost:8080/api/"` | Comunicación directa sin contenedores |
| **Producción** | `endpoint: "https://api.tudominio.com/api/"` | URL pública de tu API desplegada |

> ⚠️ **Error común**: Usar `api:8080` directamente en Angular. El navegador no resuelve nombres de servicios Docker. Siempre usa proxy Nginx (`/api/`) o `localhost`/`host.docker.internal`.

---

## 🐳 Docker & Build Reproducible

### Arquitectura del Dockerfile (Correcciones aplicadas)

```
┌──────────────────────────────────────────────────────┐
│   Dockerfile (multi-stage)                           │
│                                                      │
│   Stage 1: BUILD (Node 18 Alpine)                    │
│   ├─ npm ci (dependencias)                           │
│   ├─ ng build --configuration=prod                   │
│   └─ Output: /app/dist/...                           │
│                                                      │
│   Stage 2: RUNTIME (Nginx 1.26 Alpine)               │
│   ├─ COPY nginx.conf (proxy /api)                    │
│   ├─ COPY --from=build /dist → /usr/share/nginx/html │
│   └─ CMD: nginx -g "daemon off;"                     │
│                                                      │
│   Resultado: Imagen ~65MB                            │
└──────────────────────────────────────────────────────┘
```

### nginx.conf — Proxy `/api` + SPA Routing

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 🔥 CRÍTICO: Delegar rutas no-existentes a index.html para Angular Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 🔄 PROXY PARA API: Redirige /api/* al contenedor 'api:8080'
    # Esto evita CORS porque el navegador ve todo como mismo origen (localhost:4200)
    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 🚀 Cache agresivo para assets con hash
    location ~* \.(js|css|png|jpg|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 🔄 Sin cache para index.html: siempre verificar nueva versión
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

### Optimizaciones del Dockerfile

| Técnica | Implementación | Beneficio |
|---------|---------------|-----------|
| **Multi-stage build** | Node para build + Nginx para runtime | Imagen final ~65MB vs ~900MB con Node en runtime |
| **Alpine Linux** | `node:18-alpine` + `nginx:1.26-alpine` | Menor superficie de ataque + descarga más rápida |
| **Layer caching** | COPY `package*.json` antes que `COPY . .` | Build incremental: solo reinstala npm si cambian dependencias |
| **SPA routing** | `try_files $uri $uri/ /index.html` en Nginx | Permite recargar página en `/pages/usuarios` sin 404 |
| **Proxy `/api`** | `proxy_pass http://api:8080/api/` | Evita CORS + comunicación segura entre frontend/backend en Docker |
| **Cache headers estratégicos** | Assets: 1 año; index.html: no-store | Assets estáticos se cachean; nueva versión se detecta al instante |

### Comandos útiles de Docker

```powershell
# Construir con cache forzado (útil si cambió environment.ts)
docker build --no-cache -t sistemaventa-frontend:v1 .

# Ejecutar con puerto personalizado
docker run -d -p 4201:80 --name frontend-custom sistemaventa-frontend:v1

# Entrar al contenedor para debugging
docker exec -it frontend-test sh
# Dentro: ls /usr/share/nginx/html, cat /etc/nginx/conf.d/default.conf

# Verificar headers de cache (F12 → Network → recargar → ver Response Headers)
curl -I http://localhost:4200/main.abc123.js
curl -I http://localhost:4200/index.html
```

---

## 🧪 Evidencia de Implementación

- ✅ Routing SPA funcional con guards de autenticación (redirección a login si no hay token)
- ✅ Interceptor HTTP que inyecta `Authorization: Bearer <token>` automáticamente
- ✅ Manejo centralizado de errores 401/403 + refresh token automático
- ✅ Docker multi-stage Alpine: imagen final ~65MB vs ~900MB sin optimizar
- ✅ Nginx configurado para SPA: `try_files` + proxy `/api` + cache headers estratégicos
- ✅ Build reproducible: mismo artefacto en local, CI/CD y producción
- ✅ Documentación técnica profunda en repositorio del backend

---

## 📚 Documentación Técnica Profunda

Para detalles de implementación Docker (Nginx config, cache headers, troubleshooting), consultar la documentación completa en el repositorio del backend:

🔗 [Ver Documentación Docker en APISistemaVenta](https://github.com/jotalexvalencia/APISistemaVenta/tree/main/docs/docker)

| Archivo | Contenido |
|---------|-----------|
| `03-dockerizacion-angular.md` | Dockerfile Angular + Nginx: análisis línea por línea, trade-offs, errores comunes |
| `04-docker-compose.md` | Orquestación con backend: redes, comunicación por nombre de servicio, proxy `/api` |
| `05-troubleshooting.md` | Flujo de diagnóstico: comandos, errores reales y soluciones |

> 📌 **Nivel de dominio (ENGRAM)**: 🔄 Lo puedo repetir con checklist propio  
> *Honestidad técnica: Implementado guiado, con comprensión de trade-offs de proxy Nginx, cache y tamaño de imagen. Pendiente: aplicar runtime config dinámica (window.env) y health checks en pipeline de CI/CD.*

---

## 🔧 Troubleshooting Rápido

```powershell
# Frontend no carga en localhost:4200
docker-compose logs frontend  # Verificar errores de Nginx o build

# Error "ERR_CONNECTION_REFUSED" al llamar a la API
# → Verificar environment.ts: ¿usa "/api/" para Docker Compose?
# → Verificar que el servicio 'api' está Up en docker-compose ps

# Recargar página en /pages/usuarios da 404
# → Verificar nginx.conf: debe tener try_files $uri $uri/ /index.html;

# Build lento cada vez
# → Verificar .dockerignore: debe excluir node_modules, .angular, dist

# Imagen final muy grande (~900MB)
# → Verificar Dockerfile: debe usar multi-stage y COPY --from=build solo /dist

# Angular no detecta cambios en environment.ts
# → Forzar rebuild sin cache: docker build --no-cache -t sistemaventa-frontend:v1 .

# Error de CORS en navegador
# → Verificar que nginx.conf tiene location /api/ con proxy_pass correcto
# → Alternativa temporal: usar endpoint "http://localhost:8080/api/" en environment.ts
```

---

## 👤 Autor

**Jorge Alexander Valencia Valencia**  
Desarrollador de Software — Colombia

🔗 [LinkedIn](https://www.linkedin.com/in/jorgealexandervalencia/)  
🔗 [GitHub](https://github.com/jotalexvalencia)  
🔗 [Portafolio](https://jorgevalencia.dev) *(próximamente)*

---

> 📄 **Licencia**: MIT — Libre uso con atribución.  
> 🔄 **Última actualización**: Mayo 2026 — Angular 16 + Docker multi-stage + Nginx 1.26 Alpine + Proxy `/api`

