import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Home from './pages/Home.vue';
import Weather from './pages/Weather.vue';
import TaskList from './pages/TaskList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('./components/Layout.vue'),
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'weather', name: 'Weather', component: Weather },
      { path: 'tasks', name: 'TaskList', component: TaskList },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
