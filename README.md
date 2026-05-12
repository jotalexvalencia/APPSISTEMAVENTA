# Sistema de Ventas — Frontend Angular 16

> Aplicación Angular 16 para gestión de ventas, containerizada con Docker + Nginx. Diseñada para consumir la API .NET 10 con autenticación JWT, routing SPA optimizado y build reproducible.

[![Angular 16](https://img.shields.io/badge/Angular-16-red)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-✅-2496ED)](https://www.docker.com)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639)](https://nginx.org)

---

##  Descripción

Frontend SPA (Single Page Application) para un sistema de ventas empresarial. Proporciona interfaz para autenticación, dashboard, gestión de usuarios, productos, registro de ventas y reportes. Construida con Angular 16, Material Design y preparada para despliegue consistente con Docker.

**Características principales:**
- ✅ Routing SPA con guards de autenticación (JWT)
- ✅ Interceptor HTTP para inyección automática de tokens
- ✅ Formularios reactivos con validación en tiempo real
- ✅ Tablas paginadas + filtros + exportación a Excel
- ✅ Diseño responsive con Angular Material + FlexLayout
- ✅ Docker multi-stage: Node 18 Alpine para build + Nginx Alpine para runtime (~65MB final)

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
| **Testing** | Karma + Jasmine (unit), Cypress (E2E pendiente) | - |
| **Containerización** | Docker multi-stage + Nginx Alpine | - |

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
# 1. Construir imagen
docker build -t sistemaventa-frontend:v1 .

# 2. Ejecutar contenedor
docker run -d -p 4200:80 --name frontend-test sistemaventa-frontend:v1

# 3. Acceder a la aplicación
# Navegar a: http://localhost:4200

# 4. Ver logs si hay error
docker logs frontend-test
```

### Configuración de API URL (CRÍTICO)

El endpoint de la API debe coincidir con cómo estás ejecutando el backend:

| Escenario | Valor en `environment.ts` | Explicación |
|-----------|--------------------------|-------------|
| **Frontend en Docker, API en host** | `http://host.docker.internal:8080/api/` | `host.docker.internal` es alias de Docker Desktop para la máquina host |
| **Ambos en docker-compose** | `http://api:8080/api/` | Dentro de la red Docker, los servicios se resuelven por nombre |
| **Ambos en host (dev local)** | `http://localhost:8080/api/` | Comunicación directa sin contenedores |
| **Producción** | `https://api.tudominio.com/api/` | URL pública de tu API desplegada |

> ⚠️ **Error común**: Usar `localhost` dentro de un contenedor Angular apunta al contenedor mismo, no a tu máquina host. Resultado: `ERR_CONNECTION_REFUSED`.

---

## 🐳 Docker & Build Reproducible

### Arquitectura del Dockerfile

```
─────────────────────────────────────┐
│   Dockerfile (multi-stage)          │
│                                     │
│   Stage 1: BUILD (Node 18 Alpine)   │
│   ├─ npm ci (dependencias)          │
│   ├─ ng build --configuration=prod  │
│   └─ Output: /app/dist/...          │
│                                     │
│   Stage 2: RUNTIME (Nginx Alpine)   │
│   ├─ COPY nginx.conf (SPA routing)  │
│   ├─ COPY --from=build /dist → /usr/share/nginx/html │
│   └─ CMD: nginx -g "daemon off;"    │
│                                     │
│   Resultado: Imagen ~65MB           │
─────────────────────────────────────┘
```

### nginx.conf — Routing SPA Optimizado

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # 🔥 CRÍTICO: Delegar rutas no-existentes a index.html para Angular Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    #  Cache agresivo para assets con hash (nunca cambian sin cambiar nombre)
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
| **Alpine Linux** | `node:18-alpine` + `nginx:alpine` | Menor superficie de ataque + descarga más rápida |
| **Layer caching** | COPY `package*.json` antes que `COPY . .` | Build incremental: solo reinstala npm si cambia dependencias |
| **SPA routing** | `try_files $uri $uri/ /index.html` en Nginx | Permite recargar página en `/pages/usuarios` sin 404 |
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
- ✅ Nginx configurado para SPA: `try_files` + cache headers estratégicos
- ✅ Build reproducible: mismo artefacto en local, CI/CD y producción
- ✅ Documentación técnica profunda en `/docs/docker/`

---

###  Documentación Técnica Profunda

Para detalles de implementación Docker (Nginx config, cache headers, troubleshooting), consultar la documentación completa en el repositorio del Backend:

🔗 [Ver Documentación Docker en APISistemaVenta](https://github.com/jotalexvalencia/APISistemaVenta/tree/main/docs/docker)

> 📌 **Nivel de dominio (ENGRAM)**: 🔄 Lo puedo repetir sin ayuda  
> *Honestidad técnica: Implementado guiado, con comprensión de trade-offs de cache, routing y tamaño de imagen. Pendiente: aplicar runtime config dinámica (window.env) y health checks en pipeline de CI/CD.*

---

## 🔧 Troubleshooting Rápido

```powershell
# Frontend no carga en localhost:4200
docker logs frontend-test  # Verificar errores de Nginx o build

# Error "ERR_CONNECTION_REFUSED" al llamar a la API
# → Verificar environment.ts: ¿usa host.docker.internal o api según el escenario?

# Recargar página en /pages/usuarios da 404
# → Verificar nginx.conf: debe tener try_files $uri $uri/ /index.html;

# Build lento cada vez
# → Verificar .dockerignore: debe excluir node_modules, .angular, dist

# Imagen final muy grande (~900MB)
# → Verificar Dockerfile: debe usar multi-stage y COPY --from=build solo /dist

# Angular no detecta cambios en environment.ts
# → Forzar rebuild sin cache: docker build --no-cache -t sistemaventa-frontend:v1 .
```

---

## 👤 Autor

**Jorge Alexander Valencia Valencia**  
Desarrollador de Software — Colombia

🔗 [LinkedIn](https://www.linkedin.com/in/jorgealexandervalencia/)  
 [GitHub](https://github.com/jotalexvalencia)  
🔗 [Portafolio](https://jorgevalencia.dev) *(próximamente)*

---

> 📄 **Licencia**: MIT — Libre uso con atribución.  
>  **Última actualización**: Mayo 2026 — Angular 16 + Docker multi-stage + Nginx SPA routing
```
