import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ── Mock the API module ───────────────────────────────────────────────────────
vi.mock('../api/taskApi', () => ({
  taskApi: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCategories: vi.fn().mockResolvedValue([]),
  },
}));

import { taskApi } from '../api/taskApi';
import App from '../App';
import { Task } from '../types';

const mockTasks: Task[] = [
  { id: 1, title: 'Buy groceries', description: 'Milk and bread', status: 'TODO', dueDate: '2026-04-01', category: 'Personal' },
  { id: 2, title: 'Write report', status: 'IN_PROGRESS', category: 'Work' },
  { id: 3, title: 'Call dentist', status: 'DONE' },
];

describe('TaskFlow App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (taskApi.getAll as any).mockResolvedValue(mockTasks);
    (taskApi.getCategories as any).mockResolvedValue(['Personal', 'Work']);
  });

  it('renders the app header', async () => {
    render(<App />);
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
  });

  it('displays tasks from the API', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(screen.getByText('Write report')).toBeInTheDocument();
      expect(screen.getByText('Call dentist')).toBeInTheDocument();
    });
  });

  it('shows the correct task count in stats bar', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total
    });
  });

  it('opens the create modal when "New Task" is clicked', async () => {
    render(<App />);
    const newTaskBtn = screen.getByText('+ New Task');
    fireEvent.click(newTaskBtn);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ New Task'));
    fireEvent.click(screen.getByText('Create Task'));
    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument();
    });
  });

  it('calls taskApi.create with correct data on form submit', async () => {
    (taskApi.create as any).mockResolvedValue({ id: 4, title: 'New Task', status: 'TODO' });
    render(<App />);

    fireEvent.click(screen.getByText('+ New Task'));
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    await userEvent.type(titleInput, 'New Task');
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(taskApi.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }));
    });
  });

  it('shows an empty state when there are no tasks', async () => {
    (taskApi.getAll as any).mockResolvedValue([]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Buy groceries'));
    const deleteButtons = screen.getAllByTitle('Delete task');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it('calls taskApi.delete when confirmed', async () => {
    (taskApi.delete as any).mockResolvedValue(undefined);
    render(<App />);
    await waitFor(() => screen.getByText('Buy groceries'));
    const deleteButtons = screen.getAllByTitle('Delete task');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(taskApi.delete).toHaveBeenCalledWith(1);
    });
  });
});
