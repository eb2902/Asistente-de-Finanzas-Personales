import axios from 'axios';
import { Goal, ApiError, GoalData } from '../interfaces/financial';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

// Configurar axios con interceptores para manejo de auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface GoalResponse {
  success: boolean;
  message: string;
  data: Goal;
}

export interface GoalsResponse {
  success: boolean;
  data: {
    goals: Goal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const goalService = {
  // Crear una nueva meta
  async createGoal(data: GoalData): Promise<GoalResponse> {
    try {
      const response = await api.post<GoalResponse>('/goals', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al crear la meta');
    }
  },

  // Obtener todas las metas del usuario con paginación
  async getUserGoals(page?: number, limit?: number): Promise<GoalsResponse> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      const url = params.toString() ? `/goals?${params.toString()}` : '/goals';
      const response = await api.get<GoalsResponse>(url);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener las metas');
    }
  },

  // Obtener una meta específica
  async getGoalById(id: string): Promise<GoalResponse> {
    try {
      const response = await api.get<GoalResponse>(`/goals/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener la meta');
    }
  },

  // Actualizar una meta
  async updateGoal(id: string, data: Partial<GoalData>): Promise<GoalResponse> {
    try {
      const response = await api.put<GoalResponse>(`/goals/${id}`, data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al actualizar la meta');
    }
  },

  // Eliminar una meta
  async deleteGoal(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/goals/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al eliminar la meta');
    }
  },
};
