import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Candidate, CandidateStatus } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private readonly API_URL = `${environment.apiUrl}/candidates`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.API_URL);
  }

  getById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.API_URL}/${id}`);
  }

  getByJobPosition(jobPositionId: number): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.API_URL}/job/${jobPositionId}`);
  }

  create(candidate: Partial<Candidate>): Observable<Candidate> {
    return this.http.post<Candidate>(this.API_URL, candidate);
  }

  update(id: number, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.API_URL}/${id}`, candidate);
  }

  updateStatus(id: number, status: CandidateStatus): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.API_URL}/${id}/status?status=${status}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}

