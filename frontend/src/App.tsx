import React, { useState } from 'react';
import { Task, TaskRequest, TaskStatus, ApiError } from './types';
import { useTasks } from './hooks/useTasks';
import './index.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: '#6b7280',
  IN_PROGRESS: '#f59e0b',
  DONE: '#10b981',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr?: string, status?: TaskStatus) {
  if (!dateStr || status === 'DONE') return false;
  return new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
}

// ── TaskForm ─────────────────────────────────────────────────────────────────

interface TaskFormProps {
  initial?: Task;
  onSubmit: (req: TaskRequest) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  fieldErrors?: Record<string, string>;
}

function TaskForm({ initial, onSubmit, onCancel, submitting, fieldErrors }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'TODO');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    else if (title.length > 100) errs.title = 'Title must be ≤ 100 characters.';
    if (description.length > 500) errs.description = 'Description must be ≤ 500 characters.';
    if (category.length > 50) errs.category = 'Category must be ≤ 50 characters.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setLocalErrors(errs); return; }
    setLocalErrors({});
    await onSubmit({ title: title.trim(), description: description.trim() || undefined, status, dueDate: dueDate || undefined, category: category.trim() || undefined });
  };

  const allErrors = { ...localErrors, ...fieldErrors };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title <span className="required">*</span></label>
        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?" maxLength={101} className={allErrors.title ? 'error' : ''} />
        <span className="char-count">{title.length}/100</span>
        {allErrors.title && <p className="field-error">{allErrors.title}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Add details..." rows={3} maxLength={501} className={allErrors.description ? 'error' : ''} />
        <span className="char-count">{description.length}/500</span>
        {allErrors.description && <p className="field-error">{allErrors.description}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
            {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input id="category" type="text" value={category} onChange={e => setCategory(e.target.value)}
          placeholder="e.g. Work, Personal..." maxLength={51} className={allErrors.category ? 'error' : ''} />
        {allErrors.category && <p className="field-error">{allErrors.category}</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className={`task-card ${task.status.toLowerCase().replace('_', '-')} ${overdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <div className="task-meta">
          {task.category && <span className="task-category">{task.category}</span>}
          <span className="task-status-badge" style={{ background: STATUS_COLORS[task.status] }}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit task" aria-label="Edit">✏️</button>
          <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete task" aria-label="Delete">🗑️</button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-footer">
        {task.dueDate && (
          <span className={`task-due-date ${overdue ? 'overdue-text' : ''}`}>
            {overdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
          </span>
        )}
        <select
          className="status-select"
          value={task.status}
          onChange={e => onStatusChange(task, e.target.value as TaskStatus)}
          style={{ borderColor: STATUS_COLORS[task.status] }}
        >
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── TaskRow (List View) ──────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function TaskRow({ task, onEdit, onDelete, onStatusChange }: TaskRowProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div className={`task-row ${task.status.toLowerCase().replace('_', '-')} ${overdue ? 'overdue' : ''}`}>
      <div className="task-row-left">
        <select
          className="status-select"
          value={task.status}
          onChange={e => onStatusChange(task, e.target.value as TaskStatus)}
          style={{ borderColor: STATUS_COLORS[task.status] }}
        >
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="task-row-body">
        <span className={`task-row-title${task.status === 'DONE' ? ' done' : ''}`}>{task.title}</span>
        {task.description && <span className="task-row-desc">{task.description}</span>}
      </div>
      <div className="task-row-meta">
        {task.category && <span className="task-category">{task.category}</span>}
        {task.dueDate && (
          <span className={`task-due-date ${overdue ? 'overdue-text' : ''}`}>
            {overdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
          </span>
        )}
      </div>
      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit task" aria-label="Edit">✏️</button>
        <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete task" aria-label="Delete">🗑️</button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const {
    tasks, categories, loading, error,
    search, setSearch,
    sortBy, setSortBy,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    createTask, updateTask, deleteTask,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreate = async (req: TaskRequest) => {
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await createTask(req);
      setShowForm(false);
      showSuccess('Task created successfully!');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) setFieldErrors(apiErr.fieldErrors);
      else setFormError(apiErr.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (req: TaskRequest) => {
    if (!editingTask) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await updateTask(editingTask.id, req);
      setEditingTask(null);
      showSuccess('Task updated successfully!');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) setFieldErrors(apiErr.fieldErrors);
      else setFormError(apiErr.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setDeleteConfirm(null);
      showSuccess('Task deleted.');
    } catch {
      setFormError('Failed to delete task.');
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status,
        dueDate: task.dueDate,
        category: task.category,
      });
    } catch { /* silent inline update */ }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="brand-icon">✦</span>
            <div>
              <h1>TaskFlow</h1>
              <p className="brand-sub">Stay focused. Ship it.</p>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => { setShowForm(true); setFormError(null); setFieldErrors({}); }}>
            + New Task
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" style={{ color: STATUS_COLORS.TODO }}>{stats.todo}</span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" style={{ color: STATUS_COLORS.IN_PROGRESS }}>{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" style={{ color: STATUS_COLORS.DONE }}>{stats.done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
          </div>

          {!search && (
            <div className="filters">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              {categories.length > 0 && (
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="none">Sort: Default</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>
          )}
        </div>

        {/* Notifications */}
        {successMsg && <div className="toast success">{successMsg}</div>}
        {error && <div className="toast error">⚠️ {error}</div>}

        {/* View Toggle Bar */}
        {!loading && tasks.length > 0 && (
          <div className="view-toggle-bar">
            <span className="view-toggle-label">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
            <div className="view-toggle">
              <button className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
                Grid
              </button>
              <button className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.5" rx="1.25"/><rect x="1" y="6.75" width="14" height="2.5" rx="1.25"/><rect x="1" y="11.5" width="14" height="2.5" rx="1.25"/></svg>
                List
              </button>
            </div>
          </div>
        )}

        {/* Tasks */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading tasks…</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>{search ? 'No tasks match your search' : 'No tasks yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Create your first task to get started!'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Task</button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="tasks-grid">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={t => { setEditingTask(t); setFormError(null); setFieldErrors({}); }}
                onDelete={id => setDeleteConfirm(id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={t => { setEditingTask(t); setFormError(null); setFieldErrors({}); }}
                onDelete={id => setDeleteConfirm(id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showForm && (
        <Modal title="New Task" onClose={() => setShowForm(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            fieldErrors={fieldErrors}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <TaskForm
            initial={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            submitting={submitting}
            fieldErrors={fieldErrors}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <Modal title="Delete Task" onClose={() => setDeleteConfirm(null)}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm!)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
