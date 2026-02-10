import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Determinar si la ruta actual requiere autenticación
  const router = useRouter();
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';
  
  return (
    <AuthProvider>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
