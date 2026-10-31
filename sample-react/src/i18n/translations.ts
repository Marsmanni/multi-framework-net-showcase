export const translations = {
  en: {
    // Navigation
    appTitle: "React Sample Application",
    homeTitle: "Home",
    weatherTitle: "Weather Forecast",
    taskListTitle: "Task List",
    changeLanguage: "Change Language",
    switchApplication: "Switch application",
    
    // Home Page
    welcomeTitle: "Welcome to React Sample",
    welcomeSubtitle: "Multi-Page Demo Application",
    homeDescription: "Welcome",
    homeText: "This application demonstrates React capabilities including routing, state management, and API integration. Use the navigation to explore different pages.",
    
    // Task Card
    taskCardTitle: "My Tasks",
    taskCardSubtitle: "Active tasks overview",
    taskCardText: "You have open tasks that need your attention.",
    viewTasksButton: "View All Tasks",
    
    // Task List Page
    taskListHeader: "All Tasks",
    noTasksText: "No tasks available",
    addTaskButton: "Add Task",
    
    // Task Dialog
    createTaskDialogTitle: "Create New Task",
    editTaskDialogTitle: "Edit Task",
    taskTitleLabel: "Title",
    taskTitlePlaceholder: "Enter task title",
    taskDescriptionLabel: "Description",
    taskDescriptionPlaceholder: "Enter task description",
    taskDueDateLabel: "Due Date",
    taskStatusLabel: "Status",
    taskStatusOpen: "Open",
    taskStatusInProgress: "In Progress",
    taskStatusCompleted: "Completed",
    createButton: "Create",
    saveButton: "Save",
    cancelButton: "Cancel",
    deleteButton: "Delete",
    requiredFieldsError: "Please fill in all required fields",
    taskCreatedSuccess: "Task created successfully",
    taskUpdatedSuccess: "Task updated successfully",
    taskDeletedSuccess: "Task deleted successfully",
    taskLoadError: "Failed to load tasks. Please try again.",
    taskCreateError: "Failed to create task. Please try again.",
    
    // Weather Page
    loadWeatherButton: "Load Weather Data",
    weatherChartTitle: "Temperature & Humidity Chart",
    weatherTableHeader: "Weather Forecast Table",
    weatherDateColumn: "Date",
    weatherTempCColumn: "Temperature (°C)",
    weatherTempFColumn: "Temperature (°F)",
    weatherHumidityColumn: "Humidity (%)",
    weatherSummaryColumn: "Summary",
    weatherLoadSuccess: "Weather data loaded successfully ({0} days)",
    weatherLoadError: "Failed to load weather data: {0}",
    chartLabelTemperature: "Temperature (°C)",
    chartLabelHumidity: "Humidity (%)",
    chartLabelDate: "Date",
    
    // TicTacToe
    ticTacToeTitle: "Tic Tac Toe",
    ticTacToeSubtitle: "Play against AI",
    currentPlayerLabel: "Current Player:",
    resetGameButton: "Reset Game",
    computerStartsButton: "Computer Starts",
    
    // Sun Times
    sunTimesTitle: "Sun Times",
    sunTimesSubtitle: "Sunrise & Sunset",
    sunriseLabel: "Sunrise",
    sunsetLabel: "Sunset",
  },
  de: {
    // Navigation
    appTitle: "React Beispiel-Anwendung",
    homeTitle: "Startseite",
    weatherTitle: "Wettervorhersage",
    taskListTitle: "Aufgabenliste",
    changeLanguage: "Sprache wechseln",
    switchApplication: "Anwendung wechseln",
    
    // Home Page
    welcomeTitle: "Willkommen bei React Sample",
    welcomeSubtitle: "Multi-Page Demo-Anwendung",
    homeDescription: "Willkommen",
    homeText: "Diese Anwendung demonstriert React-Fähigkeiten einschließlich Routing, Zustandsverwaltung und API-Integration. Nutzen Sie die Navigation, um verschiedene Seiten zu erkunden.",
    
    // Task Card
    taskCardTitle: "Meine Aufgaben",
    taskCardSubtitle: "Übersicht aktiver Aufgaben",
    taskCardText: "Sie haben offene Aufgaben, die Ihre Aufmerksamkeit erfordern.",
    viewTasksButton: "Alle Aufgaben anzeigen",
    
    // Task List Page
    taskListHeader: "Alle Aufgaben",
    noTasksText: "Keine Aufgaben verfügbar",
    addTaskButton: "Aufgabe hinzufügen",
    
    // Task Dialog
    createTaskDialogTitle: "Neue Aufgabe erstellen",
    editTaskDialogTitle: "Aufgabe bearbeiten",
    taskTitleLabel: "Titel",
    taskTitlePlaceholder: "Titel eingeben",
    taskDescriptionLabel: "Beschreibung",
    taskDescriptionPlaceholder: "Beschreibung eingeben",
    taskDueDateLabel: "Fälligkeitsdatum",
    taskStatusLabel: "Status",
    taskStatusOpen: "Offen",
    taskStatusInProgress: "In Bearbeitung",
    taskStatusCompleted: "Abgeschlossen",
    createButton: "Erstellen",
    saveButton: "Speichern",
    cancelButton: "Abbrechen",
    deleteButton: "Löschen",
    requiredFieldsError: "Bitte füllen Sie alle erforderlichen Felder aus",
    taskCreatedSuccess: "Aufgabe erfolgreich erstellt",
    taskUpdatedSuccess: "Aufgabe erfolgreich aktualisiert",
    taskDeletedSuccess: "Aufgabe erfolgreich gelöscht",
    taskLoadError: "Fehler beim Laden der Aufgaben. Bitte versuchen Sie es erneut.",
    taskCreateError: "Fehler beim Erstellen der Aufgabe. Bitte versuchen Sie es erneut.",
    
    // Weather Page
    loadWeatherButton: "Wetterdaten laden",
    weatherChartTitle: "Temperatur- & Luftfeuchtigkeitsdiagramm",
    weatherTableHeader: "Wettervorhersage-Tabelle",
    weatherDateColumn: "Datum",
    weatherTempCColumn: "Temperatur (°C)",
    weatherTempFColumn: "Temperatur (°F)",
    weatherHumidityColumn: "Luftfeuchtigkeit (%)",
    weatherSummaryColumn: "Zusammenfassung",
    weatherLoadSuccess: "Wetterdaten erfolgreich geladen ({0} Tage)",
    weatherLoadError: "Fehler beim Laden der Wetterdaten: {0}",
    chartLabelTemperature: "Temperatur (°C)",
    chartLabelHumidity: "Luftfeuchtigkeit (%)",
    chartLabelDate: "Datum",
    
    // TicTacToe
    ticTacToeTitle: "Tic Tac Toe",
    ticTacToeSubtitle: "Gegen KI spielen",
    currentPlayerLabel: "Aktueller Spieler:",
    resetGameButton: "Spiel zurücksetzen",
    computerStartsButton: "Computer beginnt",
    
    // Sun Times
    sunTimesTitle: "Sonnenzeiten",
    sunTimesSubtitle: "Sonnenaufgang & Sonnenuntergang",
    sunriseLabel: "Sonnenaufgang",
    sunsetLabel: "Sonnenuntergang",
  }
};

export type Language = 'en' | 'de';
export type TranslationKey = keyof typeof translations.en;
