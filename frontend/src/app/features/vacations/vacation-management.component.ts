import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: { id: number; name: string } | null;
}

interface VacationRequest {
  id: number;
  employee: Employee;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
  days: number;
}

@Component({
  selector: 'app-vacation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Gestão de Férias e Ausências</h1>
          <p>Gerencie solicitações de férias e afastamentos</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          + Nova Solicitação
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <span class="stat-icon">⏳</span>
          <div class="stat-content">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>
        <div class="stat-card approved">
          <span class="stat-icon">✅</span>
          <div class="stat-content">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Aprovadas</span>
          </div>
        </div>
        <div class="stat-card rejected">
          <span class="stat-icon">❌</span>
          <div class="stat-content">
            <span class="stat-value">{{ rejectedCount() }}</span>
            <span class="stat-label">Rejeitadas</span>
          </div>
        </div>
        <div class="stat-card vacation">
          <span class="stat-icon">🏖️</span>
          <div class="stat-content">
            <span class="stat-value">{{ onVacationCount() }}</span>
            <span class="stat-label">Em Férias Hoje</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab() === 'pending'"
          (click)="activeTab.set('pending')"
        >
          Pendentes ({{ pendingCount() }})
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'approved'"
          (click)="activeTab.set('approved')"
        >
          Aprovadas
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'all'"
          (click)="activeTab.set('all')"
        >
          Todas
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'calendar'"
          (click)="activeTab.set('calendar')"
        >
          📅 Calendário
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
        </div>
      } @else if (activeTab() === 'calendar') {
        <!-- Calendar View -->
        <div class="calendar-view">
          <div class="calendar-header">
            <button class="btn-nav" (click)="prevMonth()">◀</button>
            <h3>{{ currentMonthName() }} {{ currentYear() }}</h3>
            <button class="btn-nav" (click)="nextMonth()">▶</button>
          </div>
          <div class="calendar-grid">
            <div class="calendar-day-header">Dom</div>
            <div class="calendar-day-header">Seg</div>
            <div class="calendar-day-header">Ter</div>
            <div class="calendar-day-header">Qua</div>
            <div class="calendar-day-header">Qui</div>
            <div class="calendar-day-header">Sex</div>
            <div class="calendar-day-header">Sáb</div>
            @for (day of calendarDays(); track $index) {
              <div 
                class="calendar-day" 
                [class.other-month]="!day.currentMonth"
                [class.today]="day.isToday"
                [class.has-events]="day.events.length > 0"
              >
                <span class="day-number">{{ day.day }}</span>
                @for (event of day.events.slice(0, 2); track event.id) {
                  <div class="day-event" [class]="'event-' + event.type.toLowerCase()">
                    {{ event.employee.name.split(' ')[0] }}
                  </div>
                }
                @if (day.events.length > 2) {
                  <div class="day-more">+{{ day.events.length - 2 }} mais</div>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- List View -->
        <div class="card">
          @if (filteredRequests().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📋</span>
              <p>Nenhuma solicitação encontrada</p>
            </div>
          } @else {
            <div class="requests-list">
              @for (request of filteredRequests(); track request.id) {
                <div class="request-card" [class]="'status-' + request.status.toLowerCase()">
                  <div class="request-avatar">
                    {{ getInitials(request.employee.name) }}
                  </div>
                  <div class="request-info">
                    <div class="request-header">
                      <h4>{{ request.employee.name }}</h4>
                      <span class="request-type" [class]="'type-' + request.type.toLowerCase()">
                        {{ getTypeLabel(request.type) }}
                      </span>
                    </div>
                    <p class="request-dept">{{ request.employee.department?.name || 'Sem departamento' }}</p>
                    <p class="request-dates">
                      📅 {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                      <span class="request-days">({{ request.days }} dias)</span>
                    </p>
                    @if (request.reason) {
                      <p class="request-reason">💬 {{ request.reason }}</p>
                    }
                  </div>
                  <div class="request-actions">
                    @if (request.status === 'PENDING') {
                      <button class="btn btn-approve" (click)="approve(request)">✓ Aprovar</button>
                      <button class="btn btn-reject" (click)="reject(request)">✗ Rejeitar</button>
                    } @else {
                      <span class="status-badge" [class]="'badge-' + request.status.toLowerCase()">
                        {{ request.status === 'APPROVED' ? 'Aprovada' : 'Rejeitada' }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nova Solicitação</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="save()">
            <div class="form-group">
              <label>Funcionário</label>
              <select [(ngModel)]="form.employeeId" name="employeeId" required>
                <option [ngValue]="null">Selecione...</option>
                @for (emp of employees(); track emp.id) {
                  <option [ngValue]="emp.id">{{ emp.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select [(ngModel)]="form.type" name="type" required>
                <option value="VACATION">🏖️ Férias</option>
                <option value="SICK_LEAVE">🏥 Licença Médica</option>
                <option value="PERSONAL">👤 Pessoal</option>
                <option value="MATERNITY">👶 Maternidade</option>
                <option value="PATERNITY">👨‍👧 Paternidade</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data Início</label>
                <input type="date" [(ngModel)]="form.startDate" name="startDate" required />
              </div>
              <div class="form-group">
                <label>Data Fim</label>
                <input type="date" [(ngModel)]="form.endDate" name="endDate" required />
              </div>
            </div>
            <div class="form-group">
              <label>Motivo (opcional)</label>
              <textarea [(ngModel)]="form.reason" name="reason" rows="3" placeholder="Descreva o motivo..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1200px; }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem; 
    }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    
    .btn { 
      padding: 0.5rem 1rem; 
      border-radius: 0.5rem; 
      cursor: pointer; 
      border: none; 
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-approve { background: #dcfce7; color: #166534; }
    .btn-approve:hover { background: #bbf7d0; }
    .btn-reject { background: #fee2e2; color: #991b1b; }
    .btn-reject:hover { background: #fecaca; }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    .stat-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }
    
    .stat-card.pending { border-color: #f59e0b; }
    .stat-card.approved { border-color: #10b981; }
    .stat-card.rejected { border-color: #ef4444; }
    .stat-card.vacation { border-color: #3b82f6; }
    
    .stat-icon { font-size: 1.5rem; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 0.75rem; color: #64748b; }
    
    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    
    .tab {
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.875rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }
    
    .tab:hover { background: #f1f5f9; }
    .tab.active { background: #3b82f6; color: white; }
    
    /* Card */
    .card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .loading-state, .empty-state { 
      padding: 3rem; 
      text-align: center; 
      color: #64748b;
    }
    .spinner { 
      width: 32px; 
      height: 32px; 
      border: 3px solid #e2e8f0; 
      border-top-color: #3b82f6; 
      border-radius: 50%; 
      animation: spin 0.8s linear infinite; 
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    
    /* Requests List */
    .requests-list {
      display: flex;
      flex-direction: column;
    }
    
    .request-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    
    .request-card:hover { background: #f8fafc; }
    .request-card:last-child { border-bottom: none; }
    
    .request-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .request-info { flex: 1; }
    
    .request-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .request-header h4 { margin: 0; font-size: 1rem; color: #1e293b; }
    
    .request-type {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      font-weight: 500;
    }
    
    .type-vacation { background: #dbeafe; color: #1e40af; }
    .type-sick_leave { background: #fef3c7; color: #92400e; }
    .type-personal { background: #e0e7ff; color: #3730a3; }
    .type-maternity { background: #fce7f3; color: #9d174d; }
    .type-paternity { background: #d1fae5; color: #065f46; }
    
    .request-dept { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b; }
    .request-dates { margin: 0.5rem 0 0; font-size: 0.875rem; color: #475569; }
    .request-days { color: #94a3b8; font-size: 0.75rem; }
    .request-reason { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b; font-style: italic; }
    
    .request-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    
    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-approved { background: #dcfce7; color: #166534; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    
    /* Calendar View */
    .calendar-view {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .calendar-header h3 { margin: 0; color: #1e293b; }
    
    .btn-nav {
      background: #f1f5f9;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      color: #475569;
    }
    
    .btn-nav:hover { background: #e2e8f0; }
    
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e2e8f0;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    .calendar-day-header {
      background: #f8fafc;
      padding: 0.75rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }
    
    .calendar-day {
      background: white;
      min-height: 80px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .calendar-day.other-month { background: #f8fafc; }
    .calendar-day.other-month .day-number { color: #94a3b8; }
    .calendar-day.today { background: #eff6ff; }
    .calendar-day.today .day-number { 
      background: #3b82f6; 
      color: white; 
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .day-number {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
    }
    
    .day-event {
      font-size: 0.65rem;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .event-vacation { background: #dbeafe; color: #1e40af; }
    .event-sick_leave { background: #fef3c7; color: #92400e; }
    .event-personal { background: #e0e7ff; color: #3730a3; }
    .event-maternity { background: #fce7f3; color: #9d174d; }
    .event-paternity { background: #d1fae5; color: #065f46; }
    
    .day-more {
      font-size: 0.6rem;
      color: #64748b;
    }
    
    /* Modal */
    .modal-overlay { 
      position: fixed; 
      inset: 0; 
      background: rgba(0,0,0,0.5); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
    }
    .modal { 
      background: white; 
      border-radius: 0.75rem; 
      width: 100%; 
      max-width: 500px; 
    }
    .modal-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 1rem 1.5rem; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .modal form { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { 
      width: 100%; 
      padding: 0.75rem; 
      border: 1px solid #e2e8f0; 
      border-radius: 0.5rem; 
      font-size: 0.875rem;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; }
    
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class VacationManagementComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  loading = signal(true);
  employees = signal<Employee[]>([]);
  requests = signal<VacationRequest[]>([]);
  showModal = signal(false);
  activeTab = signal<'pending' | 'approved' | 'all' | 'calendar'>('pending');
  
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  calendarDays = signal<any[]>([]);
  
  form: any = {
    employeeId: null,
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: ''
  };
  
  private readonly months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
    this.generateCalendar();
  }

  loadData(): void {
    // Load employees
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => this.employees.set(data)
    });

    // Simulate vacation requests (would come from API in real app)
    this.generateSampleRequests();
    this.loading.set(false);
  }

  generateSampleRequests(): void {
    const employees = [
      { id: 1, name: 'Maria Silva', email: 'maria@email.com', department: { id: 1, name: 'RH' } },
      { id: 2, name: 'João Santos', email: 'joao@email.com', department: { id: 2, name: 'TI' } },
      { id: 3, name: 'Ana Costa', email: 'ana@email.com', department: { id: 3, name: 'Financeiro' } },
      { id: 4, name: 'Pedro Oliveira', email: 'pedro@email.com', department: { id: 2, name: 'TI' } },
    ];

    const requests: VacationRequest[] = [
      {
        id: 1,
        employee: employees[0],
        startDate: '2026-01-20',
        endDate: '2026-01-30',
        type: 'VACATION',
        status: 'PENDING',
        reason: 'Férias anuais',
        createdAt: '2026-01-10',
        days: 10
      },
      {
        id: 2,
        employee: employees[1],
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        type: 'SICK_LEAVE',
        status: 'APPROVED',
        reason: 'Consulta médica e recuperação',
        createdAt: '2026-01-12',
        days: 5
      },
      {
        id: 3,
        employee: employees[2],
        startDate: '2026-01-25',
        endDate: '2026-01-26',
        type: 'PERSONAL',
        status: 'PENDING',
        reason: 'Assuntos pessoais',
        createdAt: '2026-01-14',
        days: 2
      },
      {
        id: 4,
        employee: employees[3],
        startDate: '2026-01-15',
        endDate: '2026-01-18',
        type: 'VACATION',
        status: 'APPROVED',
        reason: '',
        createdAt: '2026-01-05',
        days: 4
      }
    ];

    this.requests.set(requests);
  }

  filteredRequests(): VacationRequest[] {
    const tab = this.activeTab();
    const reqs = this.requests();
    
    if (tab === 'pending') return reqs.filter(r => r.status === 'PENDING');
    if (tab === 'approved') return reqs.filter(r => r.status === 'APPROVED');
    return reqs;
  }

  pendingCount(): number {
    return this.requests().filter(r => r.status === 'PENDING').length;
  }

  approvedCount(): number {
    return this.requests().filter(r => r.status === 'APPROVED').length;
  }

  rejectedCount(): number {
    return this.requests().filter(r => r.status === 'REJECTED').length;
  }

  onVacationCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.requests().filter(r => 
      r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today
    ).length;
  }

  currentMonthName(): string {
    return this.months[this.currentMonth()];
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const events = this.requests().filter(r => 
        r.status === 'APPROVED' && dateStr >= r.startDate && dateStr <= r.endDate
      );
      
      days.push({
        day: date.getDate(),
        currentMonth: date.getMonth() === month,
        isToday: dateStr === today,
        events
      });
    }
    
    this.calendarDays.set(days);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'VACATION': '🏖️ Férias',
      'SICK_LEAVE': '🏥 Licença Médica',
      'PERSONAL': '👤 Pessoal',
      'MATERNITY': '👶 Maternidade',
      'PATERNITY': '👨‍👧 Paternidade'
    };
    return labels[type] || type;
  }

  openModal(): void {
    this.form = { employeeId: null, type: 'VACATION', startDate: '', endDate: '', reason: '' };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  approve(request: VacationRequest): void {
    this.requests.update(reqs => 
      reqs.map(r => r.id === request.id ? { ...r, status: 'APPROVED' as const } : r)
    );
    this.generateCalendar();
  }

  reject(request: VacationRequest): void {
    this.requests.update(reqs => 
      reqs.map(r => r.id === request.id ? { ...r, status: 'REJECTED' as const } : r)
    );
  }

  save(): void {
    if (!this.form.employeeId || !this.form.startDate || !this.form.endDate) return;
    
    const employee = this.employees().find(e => e.id === this.form.employeeId);
    if (!employee) return;

    const start = new Date(this.form.startDate);
    const end = new Date(this.form.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: VacationRequest = {
      id: Date.now(),
      employee,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      type: this.form.type,
      status: 'PENDING',
      reason: this.form.reason,
      createdAt: new Date().toISOString().split('T')[0],
      days
    };

    this.requests.update(reqs => [newRequest, ...reqs]);
    this.closeModal();
  }
}

