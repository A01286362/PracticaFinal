# PracticaFinal

## Descripción

PracticaFinal es una aplicación web fullstack que permite la gestión de productos y usuarios, con autenticación JWT y protección de endpoints. El backend está construido con Node.js, Express y SQL Server, y el frontend con React y Vite. Incluye documentación Swagger y está preparada para despliegue en Azure Static Web Apps.

---

## Estructura del Proyecto

```
PracticaFinal/
├── back/        # Backend (Node.js + Express + SQL Server)
├── front/       # Frontend (React + Vite)
├── .github/     # Workflows de CI/CD
└── README.md    # Este archivo
```

---

## Backend (`back/`)

### Características
- API RESTful para productos y usuarios
- Autenticación y autorización con JWT
- Documentación Swagger en `/api-docs`
- CORS configurado para desarrollo y producción

### Variables de entorno necesarias (`.env` en `/back`):
```
DB_USER=usuario_sql
DB_PASSWORD=contraseña_sql
DB_SERVER=servidor_sql
DB_NAME=nombre_base_datos
JWT_SECRET=secreto_super_seguro
PORT=3001
```

### Comandos útiles
```bash
cd back
npm install      # Instala dependencias
npm start        # Inicia el servidor en localhost:3001
```

### Endpoints principales
- `POST   /login`         → Login de usuario (devuelve JWT)
- `POST   /register`      → Registro de usuario
- `GET    /productos`     → Listar productos (protegido)
- `POST   /productos`     → Crear producto
- `PUT    /productos/:id` → Editar producto
- `DELETE /productos/:id` → Borrar producto
- `GET    /usuarios`      → Listar usuarios (protegido)
- `PUT    /usuarios/:id`  → Editar usuario (protegido)
- `DELETE /usuarios/:id`  → Borrar usuario (protegido)

### Documentación Swagger
Accede a la documentación interactiva en:
```
http://localhost:3001/api-docs
```

---

## Frontend (`front/`)

### Características
- React + Vite
- Consumo de la API backend
- Autenticación y manejo de JWT
- Despliegue preparado para Azure Static Web Apps

### Variables de entorno necesarias (`.env` en `/front`):
```
VITE_API_URL=http://localhost:3001
```
> En producción, esta variable debe apuntar a la URL pública del backend (por ejemplo, en Azure).

### Comandos útiles
```bash
cd front
npm install      # Instala dependencias
npm run dev      # Inicia el frontend en modo desarrollo (localhost:5173)
npm run build    # Genera la build de producción
```

---

## Despliegue y CI/CD

- El frontend se despliega automáticamente en Azure Static Web Apps usando GitHub Actions (`.github/workflows/front.yml`).
- El backend debe desplegarse en Azure App Service o similar, y debe permitir CORS desde la URL del frontend desplegado.
- **Importante:** Actualiza la variable de entorno `VITE_API_URL` en los secretos de GitHub para que apunte al backend en producción.

---

## Notas de seguridad
- No subas tus archivos `.env` con credenciales a repositorios públicos.
- Cambia el `JWT_SECRET` en producción.

---

## Contacto y soporte
Para dudas o soporte, abre un issue en el repositorio o contacta al autor.
