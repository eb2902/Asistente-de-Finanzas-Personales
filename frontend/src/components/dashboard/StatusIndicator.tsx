import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../utils/api';

interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    api: {
      status: string;
      uptime: number;
    };
    database: {
      status: string;
      latency: string;
      error?: string;
    };
  };
}

const StatusIndicator: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const checkHealth = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/health`);
      
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setError(false);
      } else {
        setError(true);
        setHealth(null);
      }
    } catch {
      setError(true);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check health immediately
    checkHealth();

    // Then check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Verificando...</span>
      </div>
    );
  }

  if (error || health?.status === 'degraded' || health?.services?.database?.status !== 'connected') {
    return (
      <div className="flex items-center space-x-2 text-red-500" title="API desconectada">
        <div className="relative">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-sm font-medium">Desconectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-500" title={`Conexión establecida - Latencia: ${health?.services?.database?.latency || 'N/A'}`}>
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium">Conectado</span>
    </div>
  );
};

export default StatusIndicator;
