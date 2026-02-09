# Asistente de Finanzas Inteligente 💰

Un gestor de finanzas personales moderno y seguro que te ayuda a tomar el control de tu economía con herramientas inteligentes y análisis avanzados.

## 🚀 Propuesta de Valor

**Asistente de Finanzas Inteligente** es una solución full-stack que combina una API REST robusta con una interfaz de usuario intuitiva para ofrecer una experiencia completa de gestión financiera personal.

### ¿Por qué elegirnos?

- 🔒 **Autenticación Segura**: JWT con encriptación bcrypt para proteger tus datos
- 📊 **Análisis Inteligente**: Visualizaciones claras y distribución de gastos por categorías
- 📱 **Diseño Responsivo**: Experiencia óptima en cualquier dispositivo
- 🐳 **Infraestructura Moderna**: Docker para despliegue fácil y consistente
- 🛡️ **Seguridad Integral**: Validación de datos, CORS y cabeceras de seguridad
- ⚡ **Tecnología Actual**: TypeScript, React, Node.js y PostgreSQL

## ✨ Características Principales

### Para el Usuario
- **Registro e Inicio de Sesión Seguro**: Autenticación JWT con validación robusta
- **Dashboard Inteligente**: Resumen visual de ingresos, gastos y balance
- **Distribución de Gastos**: Gráficos intuitivos por categorías
- **Presupuesto Personalizable**: Control total sobre tus límites de gasto
- **Análisis de Patrones**: Descubre insights sobre tus hábitos financieros

### Para el Desarrollador
- **Arquitectura Modular**: Backend y frontend claramente separados
- **TypeScript en Todo el Stack**: Tipado seguro y mejor experiencia de desarrollo
- **Docker Multi-Servicio**: PostgreSQL, Backend y Frontend en contenedores
- **Pruebas Listas**: Estructura preparada para testing unitario
- **Documentación Clara**: Guías completas para desarrollo y despliegue

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** - API REST
- **TypeScript** - Tipado seguro
- **TypeORM** - ORM para PostgreSQL
- **JWT** - Autenticación segura
- **bcryptjs** - Encriptación de contraseñas
- **Joi** - Validación de datos
- **Winston** - Logging profesional

### Frontend
- **React 18** - Biblioteca de UI
- **Next.js 14** - Framework full-stack
- **TypeScript** - Tipado seguro
- **Tailwind CSS** - Estilos modernos
- **React Hook Form** - Gestión de formularios
- **Axios** - Comunicación con API

### Infraestructura
- **Docker** - Contenerización
- **PostgreSQL** - Base de datos relacional
- **Docker Compose** - Orquestación de servicios

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- Docker y Docker Compose
- Git

### 1. Clonar el Proyecto
```bash
git clone <repository-url>
cd Asistente-de-Finanzas-Personales
```

### 2. Configuración del Entorno
```bash
# Copiar archivo de variables de entorno
cp .env.example .env

# Editar las variables según tu entorno
# Especialmente JWT_SECRET (¡cambia el valor por seguridad!)
```

### 3. Desarrollo Local con Docker

#### Opción Recomendada: Todo en Docker
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Acceder a las aplicaciones
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# pgAdmin: http://localhost:5050 (opcional)
```

#### Opción Avanzada: Frontend con Docker Standalone
Para producción o entornos donde se requiere máxima optimización:

```bash
# Construir frontend con standalone output (desde la carpeta frontend/)
cd frontend
docker build -t asistente-finanzas-frontend .

# Ejecutar contenedor frontend
docker run -d -p 3000:3000 asistente-finanzas-frontend

# Características del standalone:
# - Imagen ligera basada en Alpine Linux
# - Seguridad reforzada con usuario no-root
# - Healthcheck funcional para monitoreo
# - Variables de entorno optimizadas
# - Comando de inicio: node server.js
```

#### Opción Desarrollo: Backend en Docker, Frontend Local
```bash
# Iniciar solo base de datos y pgAdmin
docker-compose up postgres pgadmin -d

# Instalar dependencias del backend
cd backend
npm install

# Iniciar backend en modo desarrollo
npm run dev

# En otra terminal, instalar dependencias del frontend
cd ../frontend
npm install

# Iniciar frontend en modo desarrollo
npm run dev
```

### 4. Estructura del Proyecto
```
Asistente-de-Finanzas-Personales/
├── backend/                 # API REST con Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── models/         # Modelos de datos (TypeORM)
│   │   ├── routes/         # Definición de rutas
│   │   ├── middleware/     # Middleware de autenticación JWT
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades y helpers
│   │   └── config/         # Configuración de base de datos y JWT
│   ├── tests/              # Pruebas unitarias
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Aplicación React con TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios API
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── utils/          # Utilidades frontend
│   │   ├── types/          # Tipos TypeScript
│   │   └── styles/         # Estilos CSS-in-JS o SCSS
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── docker/                 # Configuración Docker específica
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docker-compose.yml      # Orquestación de servicios
├── .gitignore             # Exclusiones de Git
├── README.md              # Documentación principal
└── .env.example           # Variables de entorno de ejemplo
```

### 5. Endpoints de la API

#### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil de usuario (protegido)
- `POST /api/auth/refresh` - Renovar token JWT (protegido)

#### Salud del Sistema
- `GET /api/health` - Verificar estado del sistema

### 6. Variables de Entorno Clave

#### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password_123
DB_NAME=asistente_finanzas_db

# JWT
JWT_SECRET=tu_clave_secreta_jwt_aqui_cambia_esto
JWT_EXPIRES_IN=24h

# Seguridad
BCRYPT_ROUNDS=12
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔧 Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Pruebas
npm test

# Docker
npm run docker:build
npm run docker:run
```

### Frontend
```bash
cd frontend

# Desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check

# Docker
npm run docker:build
npm run docker:run
```

### Docker
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir imágenes
docker-compose build

# Limpiar todo
docker-compose down --volumes --remove-orphans
```

## 🧪 Pruebas

El proyecto está preparado para pruebas unitarias y de integración:

```bash
# Backend tests
cd backend
npm test

# Frontend tests (cuando se implementen)
cd frontend
npm test
```

## 🚢 Despliegue en Producción

### 1. Preparar Variables de Entorno
```bash
# Crear .env para producción con valores reales
cp .env.example .env

# Configurar claves JWT seguras
JWT_SECRET="clave_jwt_muy_segura_y_unica"
```

### 2. Construir Imágenes
```bash
docker-compose build
```

### 3. Iniciar en Producción
```bash
docker-compose up -d
```

### 4. Monitoreo
```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 🔒 Seguridad

### Medidas Implementadas
- **JWT con expiración** y refresh tokens
- **Encriptación de contraseñas** con bcrypt
- **Validación de inputs** en backend y frontend
- **CORS** configurado para desarrollo/producción
- **Cabeceras de seguridad** con Helmet
- **Variables de entorno** para claves sensibles

### Recomendaciones de Seguridad
1. **Nunca uses valores por defecto** en producción
2. **Genera JWT_SECRET únicos** y seguros
3. **Limita el tiempo de expiración** de tokens
4. **Implementa rate limiting** en producción
5. **Usa HTTPS** en entornos productivos

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nombre-feature`)
3. Haz commit de tus cambios (`git commit -m 'Añade feature X'`)
4. Sube a la rama (`git push origin feature/nombre-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Revisa el archivo [LICENSE](LICENSE) para más detalles.