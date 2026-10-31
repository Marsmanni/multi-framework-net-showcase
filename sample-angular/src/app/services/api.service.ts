import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, TaskInput, TaskStatus } from '../models/task';
import { WeatherForecast } from '../models/weather-forecast';

interface ApiTask extends Omit<Task, 'status'> {
  status: number | 'Open' | 'InProgress' | 'Completed';
}

interface BackendInfo {
  version: string;
  name?: string;
  commit?: string;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

interface SunTimes {
  sunrise: string;
  sunset: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5432'
    : 'https://ui-sample-api-net1020251207105113-f3agbrhgfndybwbe.westeurope-01.azurewebsites.net';

  constructor(private readonly http: HttpClient) {}

  getBackendInfo(): Observable<BackendInfo> {
    return this.http.get<BackendInfo>(`${this.baseUrl}/Info`, { withCredentials: true });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<ApiTask[]>(`${this.baseUrl}/TaskList`, { withCredentials: true }).pipe(
      map(tasks => tasks.map(task => ({
        ...task,
        status: typeof task.status === 'string'
          ? TaskStatus[task.status]
          : task.status
      })))
    );
  }

  createTask(task: TaskInput): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/TaskList`, task, { withCredentials: true });
  }

  updateTask(id: number, task: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/TaskList/${id}`, task, { withCredentials: true });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/TaskList/${id}`, { withCredentials: true });
  }

  getWeatherForecast(): Observable<WeatherForecast[]> {
    return this.http.get<WeatherForecast[]>(`${this.baseUrl}/WeatherForecast`, { withCredentials: true });
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseUrl}/SunriseSunset/locations`, { withCredentials: true });
  }

  getSunTimes(locationId: string): Observable<SunTimes> {
    const params = new HttpParams().set('location', locationId);
    return this.http.get<SunTimes>(`${this.baseUrl}/SunriseSunset`, { params, withCredentials: true });
  }
}
