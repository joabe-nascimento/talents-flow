import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface TimeRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  recordDate: string;
  dayOfWeek: string;
  clockIn: string;
  lunchOut: string;
  lunchIn: string;
  clockOut: string;
  workedTime: string;
  overtimeTime: string;
  status: string;
}

@Component({
  selector: 'app-time-records',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Controle de Ponto" 
        subtitle="Registros de entrada e saída"
        backLink="/dashboard/finance"
        backLabel="Financeiro">
        <input type="date" [(ngModel)]="selectedDate" (change)="loadRecords()" class="date-input"/>
      </app-page-header>

      <div class="clock-section">
        <div class="clock-card">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
          <div class="clock-buttons">
            <button class="btn-clock entry" (click)="clockIn()" [disabled]="todayRecord?.clockIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Entrada
            </button>
            <button class="btn-clock lunch-out" (click)="lunchOut()" [disabled]="!todayRecord?.clockIn || todayRecord?.lunchOut">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 8V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/>
                <rect x="3" y="8" width="18" height="12" rx="2"/>
              </svg>
              Almoço
            </button>
            <button class="btn-clock lunch-in" (click)="lunchIn()" [disabled]="!todayRecord?.lunchOut || todayRecord?.lunchIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 8V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/>
                <rect x="3" y="8" width="18" height="12" rx="2"/>
                <line x1="8" y1="14" x2="16" y2="14"/>
              </svg>
              Retorno
            </button>
            <button class="btn-clock exit" (click)="clockOut()" [disabled]="!todayRecord?.clockIn || todayRecord?.clockOut">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Saída
            </button>
          </div>
          @if (todayRecord) {
            <div class="today-status">
              <span *ngIf="todayRecord.clockIn">Entrada: {{ todayRecord.clockIn }}</span>
              <span *ngIf="todayRecord.lunchOut">Almoço: {{ todayRecord.lunchOut }}</span>
              <span *ngIf="todayRecord.lunchIn">Retorno: {{ todayRecord.lunchIn }}</span>
              <span *ngIf="todayRecord.clockOut">Saída: {{ todayRecord.clockOut }}</span>
            </div>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Data</th>
                <th>Entrada</th>
                <th>Almoço</th>
                <th>Retorno</th>
                <th>Saída</th>
                <th>Trabalhado</th>
                <th>Hora Extra</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (r of records(); track r.id) {
                <tr>
                  <td>
                    <div class="employee-cell">
                      <div class="avatar">{{ getInitials(r.employeeName) }}</div>
                      <span>{{ r.employeeName }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="date">{{ formatDate(r.recordDate) }}</span>
                    <span class="day">{{ r.dayOfWeek }}</span>
                  </td>
                  <td>{{ r.clockIn || '-' }}</td>
                  <td>{{ r.lunchOut || '-' }}</td>
                  <td>{{ r.lunchIn || '-' }}</td>
                  <td>{{ r.clockOut || '-' }}</td>
                  <td class="worked">{{ r.workedTime || '-' }}</td>
                  <td class="overtime">{{ r.overtimeTime || '-' }}</td>
                  <td>
                    <span class="badge" [class]="r.status.toLowerCase()">
                      {{ getStatusLabel(r.status) }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="9" class="empty">Nenhum registro encontrado</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }
    .date-input { padding: 8px 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-size: 14px; }

    .clock-section { margin-bottom: 24px; }
    .clock-card { background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 16px; padding: 32px; text-align: center; color: white; }
    .current-time { font-size: 48px; font-weight: 700; letter-spacing: 2px; }
    .current-date { font-size: 16px; opacity: 0.9; margin-bottom: 24px; }
    .clock-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-clock { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-clock:hover:not(:disabled) { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }
    .btn-clock:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-clock svg { width: 20px; height: 20px; }
    .today-status { margin-top: 20px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; font-size: 13px; opacity: 0.9; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card { background: white; border-radius: 12px; border: 1px solid #f4f4f5; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; }
    th { font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; background: #fafafa; border-bottom: 1px solid #f4f4f5; }
    td { font-size: 13px; color: #3f3f46; border-bottom: 1px solid #f4f4f5; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #fafafa; }

    .employee-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: white; }
    .date { display: block; font-weight: 500; }
    .day { display: block; font-size: 11px; color: #71717a; }
    .worked { color: #16a34a; font-weight: 500; }
    .overtime { color: #7c3aed; font-weight: 500; }

    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.approved { background: #dcfce7; color: #16a34a; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }

    .empty { text-align: center; color: #a1a1aa; padding: 40px !important; }

    @media (max-width: 640px) {
      .clock-buttons { flex-direction: column; }
      .btn-clock { justify-content: center; }
    }
  `]
})
export class TimeRecordsComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  records = signal<TimeRecord[]>([]);
  loading = signal(true);
  selectedDate = new Date().toISOString().split('T')[0];
  currentTime = '';
  currentDate = '';
  todayRecord: TimeRecord | null = null;
  employeeId = 1; // TODO: Get from auth service

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.loadRecords();
    this.loadTodayRecord();
  }

  updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  loadRecords(): void {
    this.loading.set(true);
    this.http.get<TimeRecord[]>(`${this.API_URL}/time-records`).subscribe({
      next: (data) => { this.records.set(data); this.loading.set(false); },
      error: () => { this.records.set([]); this.loading.set(false); }
    });
  }

  loadTodayRecord(): void {
    this.http.get<TimeRecord>(`${this.API_URL}/time-records/employee/${this.employeeId}/today`).subscribe({
      next: (data) => this.todayRecord = data,
      error: () => this.todayRecord = null
    });
  }

  clockIn(): void {
    this.http.post<TimeRecord>(`${this.API_URL}/time-records/clock-in/${this.employeeId}`, {}).subscribe({
      next: (data) => { this.todayRecord = data; this.loadRecords(); }
    });
  }

  lunchOut(): void {
    this.http.post<TimeRecord>(`${this.API_URL}/time-records/lunch-out/${this.employeeId}`, {}).subscribe({
      next: (data) => { this.todayRecord = data; this.loadRecords(); }
    });
  }

  lunchIn(): void {
    this.http.post<TimeRecord>(`${this.API_URL}/time-records/lunch-in/${this.employeeId}`, {}).subscribe({
      next: (data) => { this.todayRecord = data; this.loadRecords(); }
    });
  }

  clockOut(): void {
    this.http.post<TimeRecord>(`${this.API_URL}/time-records/clock-out/${this.employeeId}`, {}).subscribe({
      next: (data) => { this.todayRecord = data; this.loadRecords(); }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { 'PENDING': 'Pendente', 'APPROVED': 'Aprovado', 'REJECTED': 'Rejeitado' };
    return labels[status] || status;
  }
}

