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
  days: number;
}

@Component({
  selector: 'app-vacation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Férias e Ausências</h1>
          <p>Gerencie solicitações</p>
        </div>
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Solicitação
        </button>
      </header>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Aprovadas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ onVacationCount() }}</span>
            <span class="stat-label">Em Férias Hoje</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
          Pendentes ({{ pendingCount() }})
        </button>
        <button class="tab" [class.active]="activeTab() === 'approved'" (click)="activeTab.set('approved')">
          Aprovadas
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">
          Todas
        </button>
      </div>

      <!-- List -->
      <div class="card">
        @if (filteredRequests().length === 0) {
          <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span>Nenhuma solicitação</span>
          </div>
        } @else {
          <div class="list">
            @for (req of filteredRequests(); track req.id) {
              <div class="request-item">
                <div class="avatar">{{ getInitials(req.employee.name) }}</div>
                <div class="request-info">
                  <div class="request-header">
                    <span class="request-name">{{ req.employee.name }}</span>
                    <span class="badge type-{{ req.type.toLowerCase() }}">{{ getTypeLabel(req.type) }}</span>
                  </div>
                  <span class="request-dept">{{ req.employee.department?.name || 'Sem departamento' }}</span>
                  <div class="request-dates">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    {{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}
                    <span class="days">({{ req.days }} dias)</span>
                  </div>
                </div>
                <div class="request-actions">
                  @if (req.status === 'PENDING') {
                    <button class="btn-approve" (click)="approve(req)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </button>
                    <button class="btn-reject" (click)="reject(req)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  } @else {
                    <span class="status-badge" [class]="req.status.toLowerCase()">
                      {{ req.status === 'APPROVED' ? 'Aprovada' : 'Rejeitada' }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nova Solicitação</h2>
            <button class="btn-close" (click)="closeModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form (ngSubmit)="save()">
            <div class="modal-body">
              <div class="field">
                <label>Funcionário</label>
                <select [(ngModel)]="form.employeeId" name="employeeId" required>
                  <option [ngValue]="null">Selecione...</option>
                  @for (emp of employees(); track emp.id) {
                    <option [ngValue]="emp.id">{{ emp.name }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Tipo</label>
                <select [(ngModel)]="form.type" name="type" required>
                  <option value="VACATION">Férias</option>
                  <option value="SICK_LEAVE">Licença Médica</option>
                  <option value="PERSONAL">Pessoal</option>
                  <option value="MATERNITY">Maternidade</option>
                  <option value="PATERNITY">Paternidade</option>
                </select>
              </div>
              <div class="row">
                <div class="field">
                  <label>Data Início</label>
                  <input type="date" [(ngModel)]="form.startDate" name="startDate" required/>
                </div>
                <div class="field">
                  <label>Data Fim</label>
                  <input type="date" [(ngModel)]="form.endDate" name="endDate" required/>
                </div>
              </div>
              <div class="field">
                <label>Motivo (opcional)</label>
                <textarea [(ngModel)]="form.reason" name="reason" rows="2" placeholder="Descreva o motivo..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { width: 100%; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary:hover { background: #6d28d9; }
    .btn-primary svg { width: 16px; height: 16px; }

    .btn-secondary {
      padding: 8px 14px;
      background: #f4f4f5;
      color: #3f3f46;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg { width: 18px; height: 18px; }

    .stat-icon.yellow { background: #fef3c7; color: #d97706; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }

    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 20px; font-weight: 600; color: #18181b; }
    .stat-label { display: block; font-size: 11px; color: #71717a; }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }

    .tab {
      padding: 8px 14px;
      background: transparent;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #71717a;
      cursor: pointer;
    }

    .tab:hover { background: #f4f4f5; }
    .tab.active { background: #7c3aed; color: white; }

    /* Card */
    .card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      overflow: hidden;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: #a1a1aa;
    }

    .empty svg { width: 40px; height: 40px; }

    .list { }

    .request-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid #f4f4f5;
    }

    .request-item:last-child { border-bottom: none; }
    .request-item:hover { background: #fafafa; }

    .avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    .request-info { flex: 1; }

    .request-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .request-name { font-size: 13px; font-weight: 500; color: #18181b; }

    .badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }

    .type-vacation { background: #dbeafe; color: #1e40af; }
    .type-sick_leave { background: #fef3c7; color: #92400e; }
    .type-personal { background: #f3e8ff; color: #7c3aed; }
    .type-maternity { background: #fce7f3; color: #be185d; }
    .type-paternity { background: #d1fae5; color: #065f46; }

    .request-dept { font-size: 11px; color: #71717a; display: block; margin-bottom: 4px; }

    .request-dates {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #3f3f46;
    }

    .request-dates svg { width: 14px; height: 14px; color: #71717a; }
    .days { font-size: 11px; color: #71717a; }

    .request-actions { display: flex; gap: 6px; }

    .btn-approve, .btn-reject {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-approve { background: #dcfce7; color: #16a34a; }
    .btn-approve:hover { background: #bbf7d0; }
    .btn-reject { background: #fee2e2; color: #dc2626; }
    .btn-reject:hover { background: #fecaca; }
    .btn-approve svg, .btn-reject svg { width: 16px; height: 16px; }

    .status-badge {
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-badge.approved { background: #dcfce7; color: #16a34a; }
    .status-badge.rejected { background: #fee2e2; color: #dc2626; }

    /* Modal */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .modal {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f4f4f5;
    }

    .modal-header h2 { font-size: 15px; font-weight: 600; margin: 0; }

    .btn-close {
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
    }

    .btn-close:hover { background: #f4f4f5; }
    .btn-close svg { width: 16px; height: 16px; }

    .modal-body { padding: 20px; }

    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field { margin-bottom: 14px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: 12px; font-weight: 500; color: #3f3f46; margin-bottom: 6px; }

    .field input, .field select, .field textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: none;
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: #7c3aed;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid #f4f4f5;
    }
  `]
})
export class VacationManagementComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  employees = signal<Employee[]>([]);
  requests = signal<VacationRequest[]>([]);
  showModal = signal(false);
  activeTab = signal<'pending' | 'approved' | 'all'>('pending');
  
  form: any = { employeeId: null, type: 'VACATION', startDate: '', endDate: '', reason: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => this.employees.set(data)
    });
    this.generateSampleRequests();
  }

  generateSampleRequests(): void {
    const employees = [
      { id: 1, name: 'Maria Silva', email: 'maria@email.com', department: { id: 1, name: 'RH' } },
      { id: 2, name: 'João Santos', email: 'joao@email.com', department: { id: 2, name: 'TI' } },
      { id: 3, name: 'Ana Costa', email: 'ana@email.com', department: { id: 3, name: 'Financeiro' } },
    ];

    this.requests.set([
      { id: 1, employee: employees[0], startDate: '2026-01-20', endDate: '2026-01-30', type: 'VACATION', status: 'PENDING', reason: '', days: 10 },
      { id: 2, employee: employees[1], startDate: '2026-02-01', endDate: '2026-02-05', type: 'SICK_LEAVE', status: 'APPROVED', reason: '', days: 5 },
      { id: 3, employee: employees[2], startDate: '2026-01-25', endDate: '2026-01-26', type: 'PERSONAL', status: 'PENDING', reason: '', days: 2 },
    ]);
  }

  filteredRequests(): VacationRequest[] {
    const tab = this.activeTab();
    if (tab === 'pending') return this.requests().filter(r => r.status === 'PENDING');
    if (tab === 'approved') return this.requests().filter(r => r.status === 'APPROVED');
    return this.requests();
  }

  pendingCount(): number { return this.requests().filter(r => r.status === 'PENDING').length; }
  approvedCount(): number { return this.requests().filter(r => r.status === 'APPROVED').length; }
  onVacationCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.requests().filter(r => r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today).length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'VACATION': 'Férias', 'SICK_LEAVE': 'Licença', 'PERSONAL': 'Pessoal', 'MATERNITY': 'Maternidade', 'PATERNITY': 'Paternidade'
    };
    return labels[type] || type;
  }

  openModal(): void {
    this.form = { employeeId: null, type: 'VACATION', startDate: '', endDate: '', reason: '' };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  approve(req: VacationRequest): void {
    this.requests.update(reqs => reqs.map(r => r.id === req.id ? { ...r, status: 'APPROVED' as const } : r));
  }

  reject(req: VacationRequest): void {
    this.requests.update(reqs => reqs.map(r => r.id === req.id ? { ...r, status: 'REJECTED' as const } : r));
  }

  save(): void {
    if (!this.form.employeeId || !this.form.startDate || !this.form.endDate) return;
    const employee = this.employees().find(e => e.id === this.form.employeeId);
    if (!employee) return;

    const start = new Date(this.form.startDate);
    const end = new Date(this.form.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    this.requests.update(reqs => [{
      id: Date.now(),
      employee,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      type: this.form.type,
      status: 'PENDING',
      reason: this.form.reason,
      days
    }, ...reqs]);
    this.closeModal();
  }
}
