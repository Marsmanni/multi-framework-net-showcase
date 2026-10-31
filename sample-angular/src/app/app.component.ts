import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ApiService } from './services/api.service';
import { Task, TaskStatus, TaskStatusValue } from './models/task';
import { WeatherForecast } from './models/weather-forecast';

type Language = 'en' | 'de';
type Page = 'home' | 'weather' | 'tasks';
type Player = 'X' | 'O' | '';
type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    appTitle: 'Angular Sample Application',
    homeTitle: 'Home',
    weatherTitle: 'Weather Forecast',
    taskListTitle: 'Task List',
    switchApplication: 'Switch application',
    welcomeTitle: 'Welcome to Angular Sample',
    welcomeSubtitle: 'Multi-Page Demo Application',
    homeDescription: 'Welcome',
    homeText: 'This application demonstrates frontend capabilities including navigation, state management, and API integration. Use the navigation to explore different pages.',
    availablePages: 'Available Pages',
    mainLandingPage: 'Main landing page',
    weatherDescription: 'View weather forecast data',
    tasksDescription: 'Manage your tasks',
    taskCardTitle: 'My Tasks',
    taskCardSubtitle: 'Active tasks overview',
    taskCardText: 'You have open tasks that need your attention.',
    viewTasksButton: 'View All Tasks',
    taskListHeader: 'All Tasks',
    noTasksText: 'No tasks available',
    addTaskButton: 'Add Task',
    createTaskDialogTitle: 'Create New Task',
    editTaskDialogTitle: 'Edit Task',
    taskTitleLabel: 'Title',
    taskTitlePlaceholder: 'Enter task title',
    taskDescriptionLabel: 'Description',
    taskDescriptionPlaceholder: 'Enter task description',
    taskDueDateLabel: 'Due Date',
    taskStatusLabel: 'Status',
    taskStatusOpen: 'Open',
    taskStatusInProgress: 'In Progress',
    taskStatusCompleted: 'Completed',
    createButton: 'Create',
    saveButton: 'Save',
    cancelButton: 'Cancel',
    deleteButton: 'Delete',
    requiredFieldsError: 'Please fill in all required fields',
    taskCreatedSuccess: 'Task created successfully',
    taskUpdatedSuccess: 'Task updated successfully',
    taskDeletedSuccess: 'Task deleted successfully',
    taskLoadError: 'Failed to load tasks. Please try again.',
    taskCreateError: 'Failed to create task. Please try again.',
    taskUpdateError: 'Failed to update task. Please try again.',
    taskDeleteError: 'Failed to delete task. Please try again.',
    deleteTaskConfirmation: 'Are you sure you want to delete task "{0}"?',
    loadWeatherButton: 'Load Weather Data',
    weatherChartTitle: 'Temperature & Humidity Chart',
    weatherTableHeader: 'Weather Forecast Table',
    weatherDateColumn: 'Date',
    weatherTempCColumn: 'Temperature (°C)',
    weatherTempFColumn: 'Temperature (°F)',
    weatherHumidityColumn: 'Humidity (%)',
    weatherSummaryColumn: 'Summary',
    weatherLoadSuccess: 'Weather data loaded successfully ({0} days)',
    weatherLoadError: 'Failed to load weather data: {0}',
    chartLabelTemperature: 'Temperature (°C)',
    chartLabelHumidity: 'Humidity (%)',
    chartLabelDate: 'Date',
    ticTacToeTitle: 'Tic Tac Toe',
    ticTacToeSubtitle: 'Play against AI',
    currentPlayerLabel: 'Current Player:',
    gameStatusInProgress: 'Game in progress',
    gameStatusWin: 'Player {0} wins!',
    gameStatusDraw: "It's a draw!",
    resetGameButton: 'Reset Game',
    computerStartsButton: 'Computer Starts',
    sunTimesTitle: 'Sun Times',
    sunTimesSubtitle: 'Sunrise & Sunset',
    selectLocation: 'Select location',
    sunriseLabel: 'Sunrise',
    sunsetLabel: 'Sunset',
    loading: 'Loading...',
    backendUnknown: 'Backend: Unknown',
    sunTimesLoadError: 'Failed to load sun times.'
  },
  de: {
    appTitle: 'Angular Beispiel-Anwendung',
    homeTitle: 'Startseite',
    weatherTitle: 'Wettervorhersage',
    taskListTitle: 'Aufgabenliste',
    switchApplication: 'Anwendung wechseln',
    welcomeTitle: 'Willkommen bei Angular Sample',
    welcomeSubtitle: 'Mehrseitige Demo-Anwendung',
    homeDescription: 'Willkommen',
    homeText: 'Diese Anwendung demonstriert Frontend-Funktionen wie Navigation, Zustandsverwaltung und API-Integration. Nutzen Sie die Navigation, um die Seiten zu erkunden.',
    availablePages: 'Verfügbare Seiten',
    mainLandingPage: 'Startseite',
    weatherDescription: 'Wettervorhersage anzeigen',
    tasksDescription: 'Aufgaben verwalten',
    taskCardTitle: 'Meine Aufgaben',
    taskCardSubtitle: 'Übersicht aktiver Aufgaben',
    taskCardText: 'Sie haben offene Aufgaben, die Ihre Aufmerksamkeit erfordern.',
    viewTasksButton: 'Alle Aufgaben anzeigen',
    taskListHeader: 'Alle Aufgaben',
    noTasksText: 'Keine Aufgaben vorhanden',
    addTaskButton: 'Aufgabe hinzufügen',
    createTaskDialogTitle: 'Neue Aufgabe erstellen',
    editTaskDialogTitle: 'Aufgabe bearbeiten',
    taskTitleLabel: 'Titel',
    taskTitlePlaceholder: 'Titel eingeben',
    taskDescriptionLabel: 'Beschreibung',
    taskDescriptionPlaceholder: 'Beschreibung eingeben',
    taskDueDateLabel: 'Fälligkeitsdatum',
    taskStatusLabel: 'Status',
    taskStatusOpen: 'Offen',
    taskStatusInProgress: 'In Bearbeitung',
    taskStatusCompleted: 'Abgeschlossen',
    createButton: 'Erstellen',
    saveButton: 'Speichern',
    cancelButton: 'Abbrechen',
    deleteButton: 'Löschen',
    requiredFieldsError: 'Bitte füllen Sie alle Pflichtfelder aus',
    taskCreatedSuccess: 'Aufgabe erfolgreich erstellt',
    taskUpdatedSuccess: 'Aufgabe erfolgreich aktualisiert',
    taskDeletedSuccess: 'Aufgabe erfolgreich gelöscht',
    taskLoadError: 'Aufgaben konnten nicht geladen werden. Bitte erneut versuchen.',
    taskCreateError: 'Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen.',
    taskUpdateError: 'Aufgabe konnte nicht aktualisiert werden. Bitte erneut versuchen.',
    taskDeleteError: 'Aufgabe konnte nicht gelöscht werden. Bitte erneut versuchen.',
    deleteTaskConfirmation: 'Möchten Sie die Aufgabe „{0}“ wirklich löschen?',
    loadWeatherButton: 'Wetterdaten laden',
    weatherChartTitle: 'Temperatur- und Luftfeuchtigkeitsdiagramm',
    weatherTableHeader: 'Wettervorhersage',
    weatherDateColumn: 'Datum',
    weatherTempCColumn: 'Temperatur (°C)',
    weatherTempFColumn: 'Temperatur (°F)',
    weatherHumidityColumn: 'Luftfeuchtigkeit (%)',
    weatherSummaryColumn: 'Zusammenfassung',
    weatherLoadSuccess: 'Wetterdaten erfolgreich geladen ({0} Tage)',
    weatherLoadError: 'Wetterdaten konnten nicht geladen werden: {0}',
    chartLabelTemperature: 'Temperatur (°C)',
    chartLabelHumidity: 'Luftfeuchtigkeit (%)',
    chartLabelDate: 'Datum',
    ticTacToeTitle: 'Tic Tac Toe',
    ticTacToeSubtitle: 'Spiele gegen die KI',
    currentPlayerLabel: 'Aktueller Spieler:',
    gameStatusInProgress: 'Spiel läuft',
    gameStatusWin: 'Spieler {0} gewinnt!',
    gameStatusDraw: 'Unentschieden!',
    resetGameButton: 'Spiel zurücksetzen',
    computerStartsButton: 'Computer beginnt',
    sunTimesTitle: 'Sonnenzeiten',
    sunTimesSubtitle: 'Sonnenaufgang und Sonnenuntergang',
    selectLocation: 'Ort auswählen',
    sunriseLabel: 'Sonnenaufgang',
    sunsetLabel: 'Sonnenuntergang',
    loading: 'Lade...',
    backendUnknown: 'Backend: Unbekannt',
    sunTimesLoadError: 'Sonnenzeiten konnten nicht geladen werden.'
  }
} as const;

interface Location {
  id: string;
  name: string;
}

interface SunTimes {
  sunrise: string;
  sunset: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  readonly applications = [
    { id: 'react', label: 'React', port: 5173, localPath: '/', path: '/apps/sample-react/' },
    { id: 'ui5', label: 'SAPUI5', port: 8080, localPath: '/index.html', path: '/apps/sample-ui5/' },
    { id: 'vue', label: 'Vue', port: 5174, localPath: '/', path: '/apps/sample-vue/' },
    { id: 'angular', label: 'Angular', port: 4200, localPath: '/', path: '/apps/sample-angular/' }
  ];
  readonly currentApplication = 'angular';
  readonly taskStatuses = TaskStatus;
  language: Language = this.getInitialLanguage();
  page: Page = 'home';
  backendVersion: string = translations[this.language].loading;
  tasks: Task[] = [];
  taskCount = 0;
  weatherData: WeatherForecast[] = [];
  locations: Location[] = [];
  selectedLocationId = '';
  sunTimes: SunTimes | null = null;
  isWeatherLoading = false;
  isTaskDialogOpen = false;
  isSavingTask = false;
  taskError = '';
  pageError = '';
  feedback = '';
  editingTask: Task | null = null;
  taskForm = this.emptyTaskForm();
  board: Player[] = Array(9).fill('');
  currentPlayer: Player = 'X';
  gameStatus = '';
  isGameOver = false;
  private gameTimer: ReturnType<typeof setTimeout> | undefined;
  private weatherChart: Chart<'line'> | undefined;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadBackendVersion();
    this.loadTaskCount();
    this.loadLocations();
  }

  get t(): (key: TranslationKey, value?: string | number) => string {
    return (key, value) => {
      const message: string = translations[this.language][key];
      return value === undefined ? message : message.replace('{0}', String(value));
    };
  }

  get isLocal(): boolean {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }

  get appVersion(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="app-version"]')?.content ?? '';
  }

  get appBuild(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="app-build"]')?.content ?? '';
  }

  get appCommit(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="app-commit"]')?.content ?? '';
  }

  get welcomeSubtitle(): string {
    const suffix = this.appVersion
      ? ` — v${this.appVersion}`
      : this.appCommit
        ? ` — ${this.appCommit.substring(0, 7)}`
        : this.appBuild
          ? ` — ${this.appBuild}`
          : '';
    return `${this.t('welcomeSubtitle')}${suffix}`;
  }

  get weatherChartConfig(): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        labels: this.weatherData.map(item => new Date(item.date).toLocaleDateString(this.language, {
          month: 'short',
          day: 'numeric'
        })),
        datasets: [
          {
            label: this.t('chartLabelTemperature'),
            data: this.weatherData.map(item => item.temperatureC),
            borderColor: '#0070f0',
            backgroundColor: 'rgba(0, 112, 240, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: this.t('chartLabelHumidity'),
            data: this.weatherData.map(item => item.humidity),
            borderColor: '#00a6ed',
            backgroundColor: 'rgba(0, 166, 237, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: this.t('chartLabelTemperature') }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            title: { display: true, text: this.t('chartLabelHumidity') },
            grid: { drawOnChartArea: false }
          },
          x: { title: { display: true, text: this.t('chartLabelDate') } }
        }
      }
    };
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('angular-language');
    return saved === 'de' ? 'de' : 'en';
  }

  private emptyTaskForm(): { title: string; description: string; dueDate: string; status: TaskStatusValue } {
    return { title: '', description: '', dueDate: '', status: TaskStatus.Open as TaskStatusValue };
  }

  setLanguage(language: Language): void {
    this.language = language;
    localStorage.setItem('angular-language', language);
    if (this.weatherChart) {
      this.weatherChart.options = this.weatherChartConfig.options ?? {};
      this.weatherChart.data = this.weatherChartConfig.data;
      this.weatherChart.update();
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.language === 'en' ? 'de' : 'en');
  }

  switchApplication(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const application = this.applications.find(({ id }) => id === target.value);
    if (!application || application.id === this.currentApplication) return;
    window.location.assign(this.isLocal
      ? `http://localhost:${application.port}${application.localPath}`
      : new URL(application.path, window.location.origin).toString());
  }

  navigate(page: Page): void {
    this.page = page;
    this.pageError = '';
    this.feedback = '';
    if (page === 'tasks') this.loadTasks();
    if (page === 'weather' && this.weatherData.length > 0) setTimeout(() => this.drawWeatherChart(), 0);
  }

  private loadBackendVersion(): void {
    this.api.getBackendInfo().subscribe({
      next: data => this.backendVersion = `Backend: ${data.version}`,
      error: error => {
        console.error('Error loading backend info:', error);
        this.backendVersion = this.t('backendUnknown');
      }
    });
  }

  loadTaskCount(): void {
    this.api.getTasks().subscribe({
      next: tasks => this.taskCount = tasks.length,
      error: error => console.error('Error loading task count:', error)
    });
  }

  loadTasks(): void {
    this.api.getTasks().subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.taskCount = tasks.length;
      },
      error: error => {
        console.error('Error loading tasks:', error);
        this.pageError = this.t('taskLoadError');
      }
    });
  }

  loadWeather(): void {
    this.isWeatherLoading = true;
    this.pageError = '';
    this.feedback = '';
    this.api.getWeatherForecast().subscribe({
      next: forecasts => {
        this.weatherData = forecasts;
        this.isWeatherLoading = false;
        this.feedback = this.t('weatherLoadSuccess', forecasts.length);
        setTimeout(() => this.drawWeatherChart(), 0);
      },
      error: error => {
        console.error('Error loading weather:', error);
        this.pageError = this.t('weatherLoadError', error.message || 'Unknown error');
        this.isWeatherLoading = false;
      }
    });
  }

  private drawWeatherChart(): void {
    const canvas = document.getElementById('weather-chart') as HTMLCanvasElement | null;
    if (!canvas || this.weatherData.length === 0) return;
    this.weatherChart?.destroy();
    this.weatherChart = new Chart(canvas, this.weatherChartConfig);
  }

  openCreateTask(): void {
    this.editingTask = null;
    this.taskForm = this.emptyTaskForm();
    this.taskError = '';
    this.isTaskDialogOpen = true;
  }

  openEditTask(task: Task): void {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate?.slice(0, 10) ?? '',
      status: task.status
    };
    this.taskError = '';
    this.isTaskDialogOpen = true;
  }

  closeTaskDialog(): void {
    this.isTaskDialogOpen = false;
  }

  saveTask(): void {
    if (!this.taskForm.title.trim() || !this.taskForm.description.trim()) {
      this.taskError = this.t('requiredFieldsError');
      return;
    }
    this.isSavingTask = true;
    const payload = {
      ...(this.editingTask ?? {}),
      ...this.taskForm,
      dueDate: this.taskForm.dueDate || null
    };
    const request = this.editingTask
      ? this.api.updateTask(this.editingTask.id, payload)
      : this.api.createTask(payload);
    request.subscribe({
      next: () => {
        this.feedback = this.t(this.editingTask ? 'taskUpdatedSuccess' : 'taskCreatedSuccess');
        this.isTaskDialogOpen = false;
        this.isSavingTask = false;
        this.loadTasks();
      },
      error: error => {
        console.error('Error saving task:', error);
        this.taskError = this.t(this.editingTask ? 'taskUpdateError' : 'taskCreateError');
        this.isSavingTask = false;
      }
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(this.t('deleteTaskConfirmation', task.title))) return;
    this.api.deleteTask(task.id).subscribe({
      next: () => {
        this.feedback = this.t('taskDeletedSuccess');
        this.loadTasks();
      },
      error: error => {
        console.error('Error deleting task:', error);
        this.pageError = this.t('taskDeleteError');
      }
    });
  }

  taskStatusLabel(status: TaskStatusValue): string {
    switch (status) {
      case TaskStatus.Open: return this.t('taskStatusOpen');
      case TaskStatus.InProgress: return this.t('taskStatusInProgress');
      case TaskStatus.Completed: return this.t('taskStatusCompleted');
    }
  }

  private loadLocations(): void {
    this.api.getLocations().subscribe({
      next: locations => {
        this.locations = locations;
        const firstLocation = locations[0];
        if (firstLocation) {
          this.selectedLocationId = firstLocation.id;
          this.loadSunTimes(firstLocation.id);
        }
      },
      error: error => {
        console.error('Error loading locations:', error);
        this.pageError = this.t('sunTimesLoadError');
      }
    });
  }

  loadSunTimes(locationId: string): void {
    this.selectedLocationId = locationId;
    this.api.getSunTimes(locationId).subscribe({
      next: times => this.sunTimes = times,
      error: error => {
        console.error('Error loading sun times:', error);
        this.sunTimes = null;
        this.pageError = this.t('sunTimesLoadError');
      }
    });
  }

  formatTime(value: string | null | undefined): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const zone = date.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
    return `${time} ${zone}`;
  }

  private checkWinner(cells: Player[]): Player {
    const patterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const [a, b, c] of patterns) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    }
    return '';
  }

  private minimax(cells: Player[], depth: number, maximizing: boolean): number {
    const winner = this.checkWinner(cells);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (cells.every(Boolean)) return 0;
    let best = maximizing ? -Infinity : Infinity;
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index]) continue;
      cells[index] = maximizing ? 'O' : 'X';
      const score = this.minimax(cells, depth + 1, !maximizing);
      cells[index] = '';
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  private computerMove(): void {
    const cells = [...this.board];
    let bestScore = -Infinity;
    const bestMoves: number[] = [];
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index]) continue;
      cells[index] = 'O';
      const score = this.minimax(cells, 0, false);
      cells[index] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMoves.length = 0;
        bestMoves.push(index);
      } else if (score === bestScore) {
        bestMoves.push(index);
      }
    }
    const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    if (move === undefined) return;
    this.board[move] = 'O';
    this.finishMove();
    if (!this.isGameOver) this.currentPlayer = 'X';
  }

  playCell(index: number): void {
    if (this.isGameOver || this.currentPlayer !== 'X' || this.board[index]) return;
    this.board[index] = 'X';
    this.finishMove();
    if (this.isGameOver) return;
    this.currentPlayer = 'O';
    this.gameTimer = setTimeout(() => this.computerMove(), 500);
  }

  private finishMove(): void {
    const winner = this.checkWinner(this.board);
    if (winner) {
      this.gameStatus = this.t('gameStatusWin', winner);
      this.isGameOver = true;
    } else if (this.board.every(Boolean)) {
      this.gameStatus = this.t('gameStatusDraw');
      this.isGameOver = true;
    } else {
      this.gameStatus = '';
    }
  }

  resetGame(): void {
    if (this.gameTimer) clearTimeout(this.gameTimer);
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.gameStatus = '';
    this.isGameOver = false;
  }

  computerStarts(): void {
    this.resetGame();
    this.board[Math.floor(Math.random() * this.board.length)] = 'O';
  }
}
