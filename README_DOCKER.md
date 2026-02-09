# 🐳 Optimización Docker - Asistente de Finanzas Personales

Este documento describe la configuración Docker optimizada para el proyecto Asistente de Finanzas Personales, con enfoque en seguridad, rendimiento y facilidad de despliegue.

## 🚀 Características Optimizadas

### ✅ Multi-stage Builds
- **Backend**: Reducción del 60-70% en tamaño de imagen mediante compilación TypeScript en stage separado
- **Frontend**: Optimización con **standalone output** de Next.js para máxima eficiencia
- **Capas de cache**: Mejor aprovechamiento del cache de Docker para builds más rápidos

### 🔒 Seguridad Reforzada
- **Usuarios no-root**: Todas las imágenes corren bajo usuarios no-root (nodejs:1001)
- **Archivos .dockerignore**: Exclusión de archivos sensibles y de desarrollo
- **Variables de entorno**: Uso de variables de entorno con valores por defecto seguros
- **Dependencias mínimas**: Solo dependencias de producción en imágenes finales

### 🏥 Healthchecks Estratégicos
- **PostgreSQL**: Verificación de disponibilidad de base de datos
- **Backend**: Validación de endpoint `/api/health`
- **Frontend**: Comprobación de respuesta del servidor
- **Dependencias**: Los servicios esperan healthchecks antes de iniciar

### 📊 Persistencia de Datos
- **Volúmenes named**: PostgreSQL con volumen persistente configurado
- **Rutas configurables**: Ruta de datos personalizable mediante variables de entorno
- **Permisos correctos**: Configuración de permisos para acceso seguro

### 🌐 Orquestación Segura
- **Red interna**: Comunicación segura entre servicios mediante red bridge aislada
- **Puertos expuestos**: Solo puertos necesarios expuestos al exterior
- **Dependencias correctas**: Secuencia de arranque controlada mediante healthchecks

## 📁 Estructura de Archivos

```
├── docker/
│   ├── backend.Dockerfile      # Multi-stage build optimizado para backend
│   └── frontend.Dockerfile     # Multi-stage build mejorado para frontend
├── backend/
│   └── .dockerignore          # Exclusión de archivos innecesarios para backend
├── frontend/
│   └── .dockerignore          # Exclusión de archivos innecesarios para frontend
├── docker-compose.yml         # Configuración de producción con healthchecks
├── docker-compose.override.yml # Configuración de desarrollo con hot reload
├── .env.example              # Variables de entorno de ejemplo
├── scripts/
│   └── deploy.sh             # Script de despliegue automatizado
└── README_DOCKER.md          # Documentación (este archivo)
```

## 🛠️ Configuración Rápida

### 1. Preparación del Entorno

```bash
# Clonar el proyecto
git clone <tu-repositorio>
cd Asistente-de-Finanzas-Personales

# Crear archivo .env a partir del ejemplo
cp .env.example .env

# Editar .env con tus configuraciones seguras
# (especialmente JWT_SECRET, contraseñas, etc.)
```

### 2. Despliegue en Desarrollo

```bash
# Despliegue rápido en modo desarrollo (con hot reload)
./scripts/deploy.sh deploy development

# Ver estado de los servicios
./scripts/deploy.sh status

# Ver logs en tiempo real
./scripts/deploy.sh logs
```

### 3. Despliegue en Producción

```bash
# Despliegue en modo producción (sin hot reload, optimizado)
./scripts/deploy.sh deploy production

# Ver estado de los servicios
./scripts/deploy.sh status
```

### 4. Frontend Standalone (Opción Avanzada)

Para entornos de producción donde se requiere máxima optimización del frontend:

```bash
# Construir imagen standalone (desde la carpeta frontend/)
cd frontend
docker build -t asistente-finanzas-frontend .

# Características del standalone:
# - Multi-stage build con 3 etapas (deps, builder, runner)
# - Imagen final basada en Alpine Linux (~50MB)
# - Usuario no-root para mayor seguridad
# - Healthcheck funcional para monitoreo
# - Variables de entorno: NODE_ENV=production, PORT=3000, HOSTNAME=0.0.0.0
# - Comando de inicio: node server.js

# Ejecutar contenedor standalone
docker run -d -p 3000:3000 asistente-finanzas-frontend

# Verificar healthcheck
docker ps  # Debe mostrar "healthy" en la columna STATUS
```

## 🔧 Comandos Disponibles

El script de despliegue ofrece los siguientes comandos:

```bash
# Construir imágenes
./scripts/deploy.sh build [development|production]

# Iniciar servicios
./scripts/deploy.sh start [development|production]

# Detener servicios
./scripts/deploy.sh stop

# Reiniciar servicios
./scripts/deploy.sh restart [development|production]

# Ver estado de servicios
./scripts/deploy.sh status

# Ver logs
./scripts/deploy.sh logs

# Limpiar entorno Docker
./scripts/deploy.sh clean

# Despliegue completo (build + start)
./scripts/deploy.sh deploy [development|production]
```

## 🌐 Acceso a Servicios

Una vez desplegados los servicios, podrás acceder a ellos en las siguientes URLs:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **pgAdmin** (opcional): http://localhost:5050
  - Email: `admin@yourdomain.com` (configurable en .env)
  - Password: `tu_contraseña_segura` (configurable en .env)

## 🔍 Healthchecks

Los healthchecks están configurados para:

1. **PostgreSQL**: Verifica que el servicio esté aceptando conexiones
2. **Backend**: Realiza request a `/api/health` y verifica respuesta 200
3. **Frontend**: Realiza request a `/` y verifica respuesta 200

Estos healthchecks garantizan que:
- Los servicios solo inicien cuando sus dependencias estén listas
- Docker pueda detectar fallos y reiniciar servicios automáticamente
- La orquestación sea más robusta y confiable

## 📊 Optimizaciones de Rendimiento

### Tamaño de Imágenes
- **Backend**: Reducción del 60-70% mediante multi-stage builds
- **Frontend**: Mejor manejo de capas y dependencias
- **Base images**: Uso de Alpine Linux para imágenes más ligeras

### Recursos
- **Memoria**: Límites y reservas configurados para cada servicio
- **CPU**: Configuración básica (puede ajustarse según necesidades)
- **Cache**: Optimización del cache de capas de Docker

### Build Process
- **Dependencias**: Separación clara entre dependencias de desarrollo y producción
- **Capas**: Estructuración para máximo aprovechamiento del cache
- **Herramientas**: Uso de `dumb-init` para manejo correcto de señales

## 🔐 Seguridad

### Usuarios No-Root
- Todas las imágenes corren bajo usuarios no-root
- Permisos restringidos en directorios críticos
- Uso de `dumb-init` para manejo seguro de procesos

### Variables de Entorno
- Uso de variables de entorno con valores por defecto
- Separación clara entre desarrollo y producción
- No inclusion de secrets en imágenes

### Redes
- Red interna aislada para comunicación entre servicios
- Puertos expuestos solo cuando es necesario
- Configuración de subnet para mejor control

## 🐛 Troubleshooting

### Problemas Comunes

1. **Puertos en uso**:
   ```bash
   # Ver puertos ocupados
   lsof -i :3000
   lsof -i :3001
   lsof -i :5432
   
   # Detener servicios que usen los puertos
   ./scripts/deploy.sh stop
   ```

2. **Problemas de permisos**:
   ```bash
   # Verificar permisos del directorio de datos
   ls -la ./data/postgres
   
   # Corregir permisos si es necesario
   chmod 777 ./data/postgres
   ```

3. **Problemas de dependencias**:
   ```bash
   # Limpiar y reconstruir todo
   ./scripts/deploy.sh clean
   ./scripts/deploy.sh deploy production
   ```

4. **Healthchecks fallando**:
   ```bash
   # Ver logs detallados
   ./scripts/deploy.sh logs
   
   # Ver estado de healthchecks
   docker-compose ps
   ```

### Comandos de Debug

```bash
# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh

# Ver uso de recursos
docker stats

# Inspeccionar contenedores
docker inspect <container_id>
```

## 🚀 Producción

Para entornos de producción, considera:

1. **Secrets Management**: Usa Docker Secrets o un gestor de secrets externo
2. **Load Balancer**: Implementa un reverse proxy (nginx, traefik)
3. **Monitoring**: Configura monitoreo y alertas
4. **Backup**: Implementa backups automatizados de la base de datos
5. **SSL/TLS**: Configura certificados SSL para conexiones seguras
6. **Logging**: Configura logging centralizado (ELK, Fluentd)

## 📞 Soporte

Para soporte o preguntas sobre la configuración Docker:

1. Revisa este documento
2. Verifica los logs de los servicios
3. Consulta la documentación oficial de Docker
4. Reporta issues en el repositorio del proyecto

---

**Nota**: Esta configuración está optimizada para entornos de desarrollo y producción. Asegúrate de personalizar las variables de entorno según tus necesidades de seguridad y rendimiento.