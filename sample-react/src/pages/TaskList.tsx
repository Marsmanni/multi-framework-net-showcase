import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Task, TaskStatusValue } from '../models/Task';
import { TaskStatus } from '../models/Task';
import './TaskList.css';
import { config } from '../config/config';

const API_BASE_URL = config.getApiBaseUrl();

export default function TaskList() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    status: TaskStatusValue;
  }>({
    title: '',
    description: '',
    dueDate: '',
    status: TaskStatus.Open
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/TaskList`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', dueDate: '', status: TaskStatus.Open });
    setShowDialog(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      status: task.status
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert(t('requiredFieldsError'));
      return;
    }

    try {
      if (editingTask) {
        // Update
        await fetch(`${API_BASE_URL}/TaskList/${editingTask.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingTask, ...formData })
        });
        alert(t('taskUpdatedSuccess'));
      } else {
        // Create
        await fetch(`${API_BASE_URL}/TaskList`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        alert(t('taskCreatedSuccess'));
      }
      setShowDialog(false);
      loadTasks();
    } catch (error) {
      alert(t('taskCreateError'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`${API_BASE_URL}/TaskList/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      alert(t('taskDeletedSuccess'));
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusText = (status: TaskStatusValue) => {
    switch (status) {
      case TaskStatus.Open: return t('taskStatusOpen');
      case TaskStatus.InProgress: return t('taskStatusInProgress');
      case TaskStatus.Completed: return t('taskStatusCompleted');
      default: return '';
    }
  };

  const getStatusClass = (status: TaskStatusValue) => {
    switch (status) {
      case TaskStatus.Open: return 'status-open';
      case TaskStatus.InProgress: return 'status-progress';
      case TaskStatus.Completed: return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="task-list-page">
      <div className="page-header">
        <h1>{t('taskListTitle')}</h1>
        <button className="btn-primary" onClick={handleCreate}>
          ➕ {t('addTaskButton')}
        </button>
      </div>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <p className="no-tasks">{t('noTasksText')}</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`task-status ${getStatusClass(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              <p className="task-description">{task.description}</p>
              {task.dueDate && (
                <p className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
              <div className="task-actions">
                <button className="btn-secondary" onClick={() => handleEdit(task)}>
                  ✏️ {t('saveButton')}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(task.id)}>
                  🗑️ {t('deleteButton')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{editingTask ? t('editTaskDialogTitle') : t('createTaskDialogTitle')}</h2>
              <button className="close-btn" onClick={() => setShowDialog(false)}>✕</button>
            </div>
            <div className="dialog-content">
              <div className="form-group">
                <label>{t('taskTitleLabel')} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('taskTitlePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('taskDescriptionLabel')} *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('taskDescriptionPlaceholder')}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>{t('taskDueDateLabel')}</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('taskStatusLabel')} *</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: Number(e.target.value) as TaskStatusValue })}
                >
                  <option value={TaskStatus.Open}>{t('taskStatusOpen')}</option>
                  <option value={TaskStatus.InProgress}>{t('taskStatusInProgress')}</option>
                  <option value={TaskStatus.Completed}>{t('taskStatusCompleted')}</option>
                </select>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setShowDialog(false)}>
                {t('cancelButton')}
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {editingTask ? t('saveButton') : t('createButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
