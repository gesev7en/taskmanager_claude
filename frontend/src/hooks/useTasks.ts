import { useState, useEffect, useCallback } from 'react';
import { Task, TaskRequest, ApiError, SortBy } from '../types';
import { taskApi } from '../api/taskApi';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('none');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      else {
        if (sortBy !== 'none') params.sortBy = sortBy;
        if (filterStatus) params.status = filterStatus;
        if (filterCategory) params.category = filterCategory;
      }
      const data = await taskApi.getAll(params);
      setTasks(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, filterStatus, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await taskApi.getCategories();
      setCategories(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createTask = async (req: TaskRequest): Promise<Task | null> => {
    try {
      const task = await taskApi.create(req);
      await fetchTasks();
      await fetchCategories();
      return task;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (id: number, req: TaskRequest): Promise<Task | null> => {
    try {
      const task = await taskApi.update(id, req);
      await fetchTasks();
      await fetchCategories();
      return task;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    try {
      await taskApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  return {
    tasks, categories, loading, error,
    search, setSearch,
    sortBy, setSortBy,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    createTask, updateTask, deleteTask, refetch: fetchTasks,
  };
}
