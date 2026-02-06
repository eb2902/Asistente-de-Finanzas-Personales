#!/bin/bash

# Asistente de Finanzas - Script de Despliegue Docker
# Este script ayuda a desplegar la aplicación con diferentes entornos

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado. Por favor, instálalo primero."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado. Por favor, instálalo primero."
        exit 1
    fi
    
    log_success "Docker y Docker Compose están instalados"
}

# Función para crear directorio de datos
create_data_dir() {
    if [ ! -d "./data/postgres" ]; then
        log_info "Creando directorio de datos para PostgreSQL..."
        mkdir -p ./data/postgres
        chmod 777 ./data/postgres
        log_success "Directorio de datos creado"
    fi
}

# Función para verificar archivo .env
check_env_file() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_warning "No se encontró .env. Copiando .env.example como .env"
            cp .env.example .env
            log_warning "Por favor, edita el archivo .env con tus configuraciones seguras"
        else
            log_error "No se encontró ni .env ni .env.example"
            exit 1
        fi
    fi
}

# Función para construir imágenes
build_images() {
    log_info "Construyendo imágenes Docker..."
    docker-compose build --no-cache
    log_success "Imágenes construidas exitosamente"
}

# Función para iniciar servicios
start_services() {
    local environment=${1:-production}
    
    log_info "Iniciando servicios en entorno: $environment"
    
    if [ "$environment" = "development" ]; then
        docker-compose up -d
        log_success "Servicios de desarrollo iniciados"
    else
        # Para producción, no usar override file
        docker-compose -f docker-compose.yml up -d
        log_success "Servicios de producción iniciados"
    fi
}

# Función para mostrar estado de servicios
show_status() {
    log_info "Estado de los servicios:"
    docker-compose ps
    
    log_info "Logs de los servicios (últimas 50 líneas):"
    docker-compose logs --tail=50
}

# Función para limpiar entorno
clean_environment() {
    log_warning "Deteniendo y eliminando todos los servicios..."
    docker-compose down -v --remove-orphans
    
    log_warning "Eliminando imágenes no utilizadas..."
    docker image prune -f
    
    log_success "Entorno limpiado"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build [environment]     Construir imágenes Docker"
    echo "  start [environment]     Iniciar servicios"
    echo "  stop                    Detener servicios"
    echo "  restart [environment]   Reiniciar servicios"
    echo "  status                  Mostrar estado de servicios"
    echo "  logs                    Mostrar logs de servicios"
    echo "  clean                   Limpiar entorno Docker"
    echo "  deploy [environment]    Desplegar completamente (build + start)"
    echo ""
    echo "Entornos disponibles:"
    echo "  development             Entorno de desarrollo (con hot reload)"
    echo "  production              Entorno de producción (por defecto)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 deploy development   # Desplegar en modo desarrollo"
    echo "  $0 deploy production    # Desplegar en modo producción"
    echo "  $0 status               # Ver estado de servicios"
}

# Función principal
main() {
    local command=${1:-help}
    local environment=${2:-production}
    
    case $command in
        "build")
            check_docker
            check_env_file
            create_data_dir
            build_images
            ;;
        "start")
            check_docker
            check_env_file
            create_data_dir
            start_services $environment
            ;;
        "stop")
            check_docker
            docker-compose down
            log_success "Servicios detenidos"
            ;;
        "restart")
            check_docker
            check_env_file
            create_data_dir
            docker-compose restart
            log_success "Servicios reiniciados"
            ;;
        "status")
            check_docker
            show_status
            ;;
        "logs")
            check_docker
            docker-compose logs -f
            ;;
        "clean")
            check_docker
            clean_environment
            ;;
        "deploy")
            check_docker
            check_env_file
            create_data_dir
            build_images
            start_services $environment
            show_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"