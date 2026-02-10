import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Si está cargando la autenticación, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si se requiere autenticación y no está autenticado, redirigir a login
  if (requireAuth && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Si no se requiere autenticación y está autenticado, redirigir al dashboard
  if (!requireAuth && isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;