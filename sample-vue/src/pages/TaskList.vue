<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { config } from '../config';
import type { Task, TaskStatusValue } from '../models/Task';
import { TaskStatus } from '../models/Task';

const { t } = useI18n();
const apiBaseUrl = config.getApiBaseUrl();
const tasks = ref<Task[]>([]);
const showDialog = ref(false);
const editingTask = ref<Task | null>(null);
const error = ref('');
const feedback = ref('');
const saving = ref(false);
const formData = ref({
  title: '',
  description: '',
  dueDate: '',
  status: TaskStatus.Open as TaskStatusValue
});

function statusLabel(status: TaskStatusValue) {
  switch (status) {
    case TaskStatus.Open: return t('open');
    case TaskStatus.InProgress: return t('inProgress');
    case TaskStatus.Completed: return t('completed');
    default: return '';
  }
}

async function loadTasks() {
  error.value = '';
  try {
    const response = await fetch(`${apiBaseUrl}/TaskList`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tasks.value = await response.json() as Task[];
  } catch (err) {
    console.error('Error loading tasks:', err);
    error.value = t('taskLoadError');
  }
}

function openCreateDialog() {
  editingTask.value = null;
  formData.value = { title: '', description: '', dueDate: '', status: TaskStatus.Open };
  error.value = '';
  feedback.value = '';
  showDialog.value = true;
}

function openEditDialog(task: Task) {
  editingTask.value = task;
  formData.value = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.slice(0, 10) ?? '',
    status: task.status
  };
  error.value = '';
  feedback.value = '';
  showDialog.value = true;
}

async function saveTask() {
  if (!formData.value.title.trim() || !formData.value.description.trim()) {
    error.value = t('requiredFieldsError');
    return;
  }
  saving.value = true;
  error.value = '';
  feedback.value = '';
  try {
    const taskBeingEdited = editingTask.value;
    const isEditing = taskBeingEdited !== null;
    const url = taskBeingEdited
      ? `${apiBaseUrl}/TaskList/${taskBeingEdited.id}`
      : `${apiBaseUrl}/TaskList`;
    const response = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(taskBeingEdited ?? {}),
        ...formData.value,
        dueDate: formData.value.dueDate || null
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showDialog.value = false;
    feedback.value = isEditing ? t('taskUpdatedSuccess') : t('taskCreatedSuccess');
    await loadTasks();
  } catch (err) {
    console.error('Error saving task:', err);
    error.value = t('taskSaveError');
  } finally {
    saving.value = false;
  }
}

async function deleteTask(task: Task) {
  if (!confirm(t('confirmDelete', { title: task.title }))) return;
  error.value = '';
  feedback.value = '';
  try {
    const response = await fetch(`${apiBaseUrl}/TaskList/${task.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    feedback.value = t('taskDeletedSuccess');
    await loadTasks();
  } catch (err) {
    console.error('Error deleting task:', err);
    error.value = t('taskDeleteError');
  }
}

onMounted(() => void loadTasks());
</script>

<template>
  <section class="task-page">
    <div class="page-header">
      <h1>{{ t('taskListTitle') }}</h1>
      <button class="button-primary" type="button" @click="openCreateDialog">＋ {{ t('addTask') }}</button>
    </div>

    <p v-if="error && !showDialog" class="error-message" role="alert">{{ error }}</p>
    <p v-if="feedback" class="success-message" role="status">{{ feedback }}</p>
    <div v-if="tasks.length === 0 && !error" class="empty-state">{{ t('noTasks') }}</div>
    <div v-else class="tasks-grid">
      <article v-for="task in tasks" :key="task.id" class="card task-card">
        <div class="task-card-header">
          <h2>{{ task.title }}</h2>
          <span class="status-badge" :class="`status-${task.status}`">{{ statusLabel(task.status) }}</span>
        </div>
        <p class="task-description">{{ task.description }}</p>
        <p v-if="task.dueDate" class="task-due-date">{{ t('dueDate') }}: {{ new Date(task.dueDate).toLocaleDateString() }}</p>
        <div class="task-actions">
          <button class="button-secondary" type="button" @click="openEditDialog(task)">{{ t('edit') }}</button>
          <button class="button-danger" type="button" @click="deleteTask(task)">{{ t('delete') }}</button>
        </div>
      </article>
    </div>

    <div v-if="showDialog" class="dialog-backdrop" @click.self="showDialog = false">
      <section class="dialog card" role="dialog" aria-modal="true" :aria-label="editingTask ? t('editTask') : t('createTask')">
        <div class="card-header">
          <h2>{{ editingTask ? t('editTask') : t('createTask') }}</h2>
        </div>
        <form class="dialog-form" @submit.prevent="saveTask">
          <label>
            {{ t('title') }} *
            <input v-model="formData.title" :placeholder="t('titlePlaceholder')" required maxlength="200" />
          </label>
          <label>
            {{ t('description') }} *
            <textarea v-model="formData.description" :placeholder="t('descriptionPlaceholder')" required rows="4" />
          </label>
          <label>
            {{ t('dueDate') }}
            <input v-model="formData.dueDate" type="date" />
          </label>
          <label>
            {{ t('status') }}
            <select v-model.number="formData.status">
              <option :value="TaskStatus.Open">{{ t('open') }}</option>
              <option :value="TaskStatus.InProgress">{{ t('inProgress') }}</option>
              <option :value="TaskStatus.Completed">{{ t('completed') }}</option>
            </select>
          </label>
          <p v-if="error" class="error-message" role="alert">{{ error }}</p>
          <div class="dialog-actions">
            <button class="button-secondary" type="button" @click="showDialog = false">{{ t('cancel') }}</button>
            <button class="button-primary" type="submit" :disabled="saving">{{ saving ? t('loading') : editingTask ? t('save') : t('create') }}</button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
}

.task-card {
  padding: 1.2rem;
}

.task-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.task-card-header h2 {
  margin: 0;
  font-size: 1.15rem;
  overflow-wrap: anywhere;
}

.task-description {
  min-height: 2rem;
  color: #4e566b;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.task-due-date {
  color: var(--muted);
  font-size: 0.9rem;
}

.status-badge {
  flex: 0 0 auto;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: #eef0ff;
  color: #4859b2;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-1 {
  background: #fff3dc;
  color: #805700;
}

.status-2 {
  background: #e2f5eb;
  color: #24633d;
}

.task-actions,
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #11182780;
}

.dialog {
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-form {
  display: grid;
  gap: 1rem;
  padding: 1.3rem;
}

.dialog-form label {
  display: grid;
  gap: 0.4rem;
  font-weight: 600;
}

.dialog-form input,
.dialog-form textarea,
.dialog-form select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-weight: 400;
}

.empty-state {
  padding: 2rem;
  color: var(--muted);
  text-align: center;
  background: white;
  border: 1px dashed var(--border);
  border-radius: 10px;
}
</style>
