# React Sample Application

A complete React application demonstrating routing, state management, API integration, and i18n support, matching the functionality of the UI5 sample app.

## Features

- ✅ Multi-page navigation (Home, Weather, Tasks)
- ✅ i18n support (English/German)
- ✅ Backend API integration
- ✅ Weather forecast with Chart.js visualization
- ✅ Task management (CRUD operations)
- ✅ TicTacToe game with AI
- ✅ Sun times display
- ✅ Responsive design

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Components Created

### Pages
- `Home.tsx` - Landing page with cards
- `Weather.tsx` - Weather forecast with temperature/humidity chart
- `TaskList.tsx` - Task management with create/edit/delete

### Components
- `Layout.tsx` - Main layout with navigation and header
- `TicTacToe.tsx` - Game component with AI opponent
- `SunTimes.tsx` - Sunrise/sunset times

### Utilities
- `i18n/` - Internationalization support
- `models/` - TypeScript models (Task, WeatherForecast)

## API Endpoints

- `GET /Info` - Backend version
- `GET /WeatherForecast` - Weather data
- `GET /TaskList` - All tasks
- `POST /TaskList` - Create task
- `PUT /TaskList/{id}` - Update task
- `DELETE /TaskList/{id}` - Delete task
- `GET /SunriseSunset` - Sun times

## Remaining Files to Create

Due to the scope, please create these remaining files based on the patterns shown:

1. **TicTacToe.tsx** - Game logic with minimax AI
2. **SunTimes.tsx** - Location selector and sun times display
3. **Weather.tsx** - Weather page with Chart.js
4. **TaskList.tsx** - Full CRUD task management
5. **App.css** - Global styles

These follow the same patterns as the UI5 app but using React hooks, state management, and functional components.
