# Transporte Comercial - Backend (NestJS)

API REST y motor de estimación de retrasos para el sistema de transporte de carga en Colombia.

## Tecnologías
- **Framework:** NestJS 11 con TypeScript
- **ORM:** TypeORM
- **Base de Datos:** PostgreSQL
- **Documentación:** Swagger OpenAPI (`/api/docs`)
- **Autenticación:** JWT (JSON Web Tokens) con Passport

---

## Requisitos Previos
- Node.js (versión 20 o superior recomendada)
- PostgreSQL (nativo en puerto 5432 o mediante Docker)

---

## Instalación y Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Copiar `.env.example` a `.env` y ajustar credenciales:
```bash
cp .env.example .env
```

3. Levantar base de datos con Docker (opcional si ya tienes PostgreSQL instalado):
```bash
docker compose up -d
```

---

## Ejecución del Servidor

- Modo desarrollo con recarga automática:
```bash
npm run start:dev
```

- Modo producción (compilar y ejecutar):
```bash
npm run build
npm run start:prod
```

---

## Documentación Swagger
Una vez iniciado el servidor, accede a la documentación interactiva en:
```
http://localhost:3000/api/docs
```

## Estructura del Proyecto
- `src/auth`: Autenticación, JWT, registro y login de conductores/administradores.
- `src/users`: Gestión de usuarios y perfiles.
- `src/routes`: Gestión de rutas de transporte de carga y estados de viaje.
- `src/road-incidents`: Novedades e incidentes viales (cierres, derrumbes).
- `src/telemetry`: Ingesta de telemetría GPS y cálculo de velocidades.
- `src/delay-engine`: Motor analítico de cálculo y predicción de demoras.
- `src/shared`: Interfaces y tipos comunes.
