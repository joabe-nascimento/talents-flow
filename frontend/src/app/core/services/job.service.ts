import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { JobPosition } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly API_URL = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(this.API_URL);
  }

  getOpen(): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(`${this.API_URL}/open`);
  }

  getById(id: number): Observable<JobPosition> {
    return this.http.get<JobPosition>(`${this.API_URL}/${id}`);
  }

  create(job: Partial<JobPosition>): Observable<JobPosition> {
    return this.http.post<JobPosition>(this.API_URL, job);
  }

  update(id: number, job: Partial<JobPosition>): Observable<JobPosition> {
    return this.http.put<JobPosition>(`${this.API_URL}/${id}`, job);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}

