import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Employee {
  id: number;
  name: string;
  email: string;
  departmentName: string | null;
}

interface VacationRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  departmentName: string | null;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason: string;
  days: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface VacationStats {
  pending: number;
  approved: number;
  rejected: number;
  onVacationToday: number;
}

@Component({
  selector: 'app-vacation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Férias e Ausências" 
        subtitle="Gerencie solicitações"
        backLink="/dashboard/management"
        backLabel="Gestão RH">
        <button class="btn-export" (click)="exportPdf()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Exportar PDF
        </button>
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Solicitação
        </button>
      </app-page-header>

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
            <span class="stat-value">{{ stats()?.pending || 0 }}</span>
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
            <span class="stat-value">{{ stats()?.approved || 0 }}</span>
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
            <span class="stat-value">{{ stats()?.onVacationToday || 0 }}</span>
            <span class="stat-label">Em Férias Hoje</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'pending'" (click)="setTab('pending')">
          Pendentes ({{ stats()?.pending || 0 }})
        </button>
        <button class="tab" [class.active]="activeTab() === 'approved'" (click)="setTab('approved')">
          Aprovadas
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          Todas
        </button>
      </div>

      <!-- List -->
      <div class="card">
        @if (loading()) {
          <div class="loading"><div class="spinner"></div></div>
        } @else if (filteredRequests().length === 0) {
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
                <div class="avatar">{{ getInitials(req.employeeName) }}</div>
                <div class="request-info">
                  <div class="request-header">
                    <span class="request-name">{{ req.employeeName }}</span>
                    <span class="badge type-{{ req.type.toLowerCase() }}">{{ getTypeLabel(req.type) }}</span>
                  </div>
                  <span class="request-dept">{{ req.departmentName || 'Sem departamento' }}</span>
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
                    <button class="btn-approve" (click)="approve(req)" title="Aprovar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </button>
                    <button class="btn-reject" (click)="reject(req)" title="Rejeitar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  } @else {
                    <span class="status-badge" [class]="req.status.toLowerCase()">
                      {{ getStatusLabel(req.status) }}
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
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
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

    .header h1 { font-size: 20px; font-weight: 600; color: var(--text-primary, #18181b); margin: 0; }
    .header p { font-size: 13px; color: var(--text-secondary, #71717a); margin: 4px 0 0; }

    .header-actions { display: flex; gap: 10px; }

    .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #3f3f46);
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-export:hover { background: var(--border-color, #f4f4f5); }
    .btn-export svg { width: 16px; height: 16px; }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 120px;
      height: 40px;
      padding: 0 20px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-primary:hover { background: #6d28d9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary svg { width: 18px; height: 18px; }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 120px;
      height: 40px;
      padding: 0 20px;
      background: var(--border-color, #f4f4f5);
      color: var(--text-primary, #3f3f46);
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-secondary:hover { background: var(--text-muted, #e4e4e7); }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
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
    .stat-value { display: block; font-size: 20px; font-weight: 600; color: var(--text-primary, #18181b); }
    .stat-label { display: block; font-size: 11px; color: var(--text-secondary, #71717a); }

    /* Loading */
    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid var(--border-color, #e4e4e7); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }

    .tab {
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #71717a);
      cursor: pointer;
    }

    .tab:hover { background: var(--border-color, #f4f4f5); }
    .tab.active { background: #7c3aed; color: white; }

    /* Card */
    .card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
      overflow: hidden;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: var(--text-muted, #a1a1aa);
    }

    .empty svg { width: 40px; height: 40px; }

    .request-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color, #f4f4f5);
    }

    .request-item:last-child { border-bottom: none; }
    .request-item:hover { background: var(--border-color, #fafafa); }

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

    .request-name { font-size: 13px; font-weight: 500; color: var(--text-primary, #18181b); }

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

    .request-dept { font-size: 11px; color: var(--text-secondary, #71717a); display: block; margin-bottom: 4px; }

    .request-dates {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-primary, #3f3f46);
    }

    .request-dates svg { width: 14px; height: 14px; color: var(--text-secondary, #71717a); }
    .days { font-size: 11px; color: var(--text-secondary, #71717a); }

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
    .status-badge.cancelled { background: #f4f4f5; color: #71717a; }

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
      background: var(--bg-secondary, #fff);
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
      border-bottom: 1px solid var(--border-color, #f4f4f5);
    }

    .modal-header h2 { font-size: 15px; font-weight: 600; margin: 0; color: var(--text-primary, #18181b); }

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
      color: var(--text-secondary, #71717a);
    }

    .btn-close:hover { background: var(--border-color, #f4f4f5); }
    .btn-close svg { width: 16px; height: 16px; }

    .modal-body { padding: 20px; }

    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field { margin-bottom: 14px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: 12px; font-weight: 500; color: var(--text-primary, #3f3f46); margin-bottom: 6px; }

    .field input, .field select, .field textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: none;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #18181b);
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
      border-top: 1px solid var(--border-color, #f4f4f5);
    }

    @media (max-width: 640px) {
      .stats { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .header-actions { width: 100%; }
      .header-actions .btn-primary { flex: 1; }
    }
  `]
})
export class VacationManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private readonly API_URL = environment.apiUrl;
  
  employees = signal<Employee[]>([]);
  requests = signal<VacationRequest[]>([]);
  stats = signal<VacationStats | null>(null);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  activeTab = signal<'pending' | 'approved' | 'all'>('pending');
  
  form: any = { employeeId: null, type: 'VACATION', startDate: '', endDate: '', reason: '' };

  ngOnInit(): void { 
    this.loadData(); 
  }

  loadData(): void {
    this.loading.set(true);
    
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => this.employees.set(data)
    });

    this.http.get<VacationStats>(`${this.API_URL}/vacations/stats`).subscribe({
      next: (data) => this.stats.set(data)
    });

    this.http.get<VacationRequest[]>(`${this.API_URL}/vacations`).subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filteredRequests(): VacationRequest[] {
    const tab = this.activeTab();
    if (tab === 'pending') return this.requests().filter(r => r.status === 'PENDING');
    if (tab === 'approved') return this.requests().filter(r => r.status === 'APPROVED');
    return this.requests();
  }

  setTab(tab: 'pending' | 'approved' | 'all'): void {
    this.activeTab.set(tab);
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente', 'APPROVED': 'Aprovada', 'REJECTED': 'Rejeitada', 'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  openModal(): void {
    this.form = { employeeId: null, type: 'VACATION', startDate: '', endDate: '', reason: '' };
    this.showModal.set(true);
  }

  closeModal(): void { 
    this.showModal.set(false); 
  }

  approve(req: VacationRequest): void {
    // Get current user employee ID from localStorage
    const userStr = localStorage.getItem('talentflow_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const approverId = user?.employeeId || 1; // Default to 1 if not found

    this.http.patch<VacationRequest>(`${this.API_URL}/vacations/${req.id}/approve?approverEmployeeId=${approverId}`, {}).subscribe({
      next: () => {
        this.toast.success('Solicitação aprovada com sucesso');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao aprovar solicitação')
    });
  }

  reject(req: VacationRequest): void {
    const reason = prompt('Motivo da rejeição (opcional):');
    const userStr = localStorage.getItem('talentflow_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const approverId = user?.employeeId || 1;

    let url = `${this.API_URL}/vacations/${req.id}/reject?approverEmployeeId=${approverId}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;

    this.http.patch<VacationRequest>(url, {}).subscribe({
      next: () => {
        this.toast.success('Solicitação rejeitada');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao rejeitar solicitação')
    });
  }

  save(): void {
    if (!this.form.employeeId || !this.form.startDate || !this.form.endDate) {
      this.toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving.set(true);

    const payload = {
      employeeId: this.form.employeeId,
      type: this.form.type,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      reason: this.form.reason
    };

    this.http.post<VacationRequest>(`${this.API_URL}/vacations`, payload).subscribe({
      next: () => {
        this.toast.success('Solicitação criada com sucesso');
        this.closeModal();
        this.loadData();
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erro ao criar solicitação');
        this.saving.set(false);
      }
    });
  }

  exportPdf(): void {
    this.http.get(`${this.API_URL}/reports/export/vacations/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ferias_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('PDF exportado com sucesso');
      },
      error: () => this.toast.error('Erro ao exportar PDF')
    });
  }
}
