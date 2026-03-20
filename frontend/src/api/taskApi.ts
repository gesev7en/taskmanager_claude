import axios, { AxiosError } from 'axios';
import { Task, TaskRequest, ApiError } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/tasks`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function handleError(err: unknown): never {
  const axiosErr = err as AxiosError<ApiError>;
  if (axiosErr.response?.data) {
    throw axiosErr.response.data;
  }
  throw { status: 0, error: 'Network Error', message: 'Could not reach the server.' } as ApiError;
}

export const taskApi = {
  getAll: async (params?: { search?: string; sortBy?: string; status?: string; category?: string }): Promise<Task[]> => {
    try {
      const res = await api.get<Task[]>('', { params });
      return res.data;
    } catch (err) { return handleError(err); }
  },

  getById: async (id: number): Promise<Task> => {
    try {
      const res = await api.get<Task>(`/${id}`);
      return res.data;
    } catch (err) { return handleError(err); }
  },

  create: async (task: TaskRequest): Promise<Task> => {
    try {
      const res = await api.post<Task>('', task);
      return res.data;
    } catch (err) { return handleError(err); }
  },

  update: async (id: number, task: TaskRequest): Promise<Task> => {
    try {
      const res = await api.put<Task>(`/${id}`, task);
      return res.data;
    } catch (err) { return handleError(err); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (err) { return handleError(err); }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const res = await api.get<string[]>('/categories');
      return res.data;
    } catch (err) { return handleError(err); }
  },
};
