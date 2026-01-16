import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  departmentId: number | null;
  departmentName: string | null;
  status: string;
  hireDate: string;
  phone: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Funcionários" 
        [subtitle]="filteredEmployees().length + ' registros'"
        backLink="/dashboard/people"
        backLabel="Pessoas">
        <button class="btn-export" (click)="exportPdf()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          PDF
        </button>
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar
        </button>
      </app-page-header>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
          />
          @if (searchTerm) {
            <button class="clear-search" (click)="clearSearch()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
        </div>
        <select [(ngModel)]="filterDepartment" (ngModelChange)="onFilterChange()">
          <option [ngValue]="null">Todos os departamentos</option>
          @for (dept of departments(); track dept.id) {
            <option [ngValue]="dept.id">{{ dept.name }}</option>
          }
        </select>
        <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()">
          <option [ngValue]="null">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="ON_LEAVE">Afastado</option>
          <option value="TERMINATED">Desligado</option>
        </select>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          @if (filteredEmployees().length === 0) {
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>{{ searchTerm || filterDepartment || filterStatus ? 'Nenhum resultado encontrado' : 'Nenhum funcionário cadastrado' }}</span>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (emp of filteredEmployees(); track emp.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="avatar">{{ getInitials(emp.name) }}</div>
                        <div>
                          <span class="name">{{ emp.name }}</span>
                          <span class="email">{{ emp.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ emp.position }}</td>
                    <td>{{ emp.departmentName || '-' }}</td>
                    <td>
                      <span class="badge" [class]="emp.status.toLowerCase()">
                        {{ getStatusLabel(emp.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="btn-icon" (click)="edit(emp)" title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button class="btn-icon danger" (click)="delete(emp)" title="Excluir">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Funcionário</h2>
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
                <label>Nome</label>
                <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Nome completo"/>
              </div>
              <div class="field">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" required placeholder="email@empresa.com"/>
              </div>
              <div class="field">
                <label>Cargo</label>
                <input type="text" [(ngModel)]="form.position" name="position" required placeholder="Ex: Desenvolvedor"/>
              </div>
              <div class="field">
                <label>Departamento</label>
                <select [(ngModel)]="form.departmentId" name="departmentId" required>
                  <option [ngValue]="null">Selecione...</option>
                  @for (dept of departments(); track dept.id) {
                    <option [ngValue]="dept.id">{{ dept.name }}</option>
                  }
                </select>
              </div>
              @if (!editing()) {
                <div class="field">
                  <label>Senha</label>
                  <input type="password" [(ngModel)]="form.password" name="password" required placeholder="••••••••"/>
                </div>
              }
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

    /* Filters */
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .search-box {
      flex: 1;
      max-width: 300px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box svg {
      position: absolute;
      left: 12px;
      width: 16px;
      height: 16px;
      color: var(--text-muted, #a1a1aa);
    }

    .search-box input {
      width: 100%;
      padding: 10px 36px 10px 36px;
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #18181b);
    }

    .search-box input:focus {
      outline: none;
      border-color: #7c3aed;
    }

    .clear-search {
      position: absolute;
      right: 8px;
      width: 20px;
      height: 20px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted, #a1a1aa);
      padding: 0;
    }

    .clear-search:hover { color: var(--text-primary, #18181b); }
    .clear-search svg { width: 14px; height: 14px; }

    .filters select {
      padding: 10px 12px;
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #18181b);
      min-width: 180px;
    }

    .filters select:focus {
      outline: none;
      border-color: #7c3aed;
    }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid var(--border-color, #e4e4e7); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

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

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; }
    th { font-size: 11px; font-weight: 600; color: var(--text-secondary, #71717a); text-transform: uppercase; letter-spacing: 0.5px; background: var(--border-color, #fafafa); border-bottom: 1px solid var(--border-color, #f4f4f5); }
    td { font-size: 13px; color: var(--text-primary, #3f3f46); border-bottom: 1px solid var(--border-color, #f4f4f5); }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: var(--border-color, #fafafa); }

    .user-cell { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }

    .name { display: block; font-weight: 500; color: var(--text-primary, #18181b); }
    .email { display: block; font-size: 12px; color: var(--text-secondary, #71717a); }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge.active { background: #dcfce7; color: #16a34a; }
    .badge.on_leave { background: #fef3c7; color: #92400e; }
    .badge.terminated { background: #fee2e2; color: #dc2626; }

    .actions { display: flex; gap: 4px; }

    .btn-icon {
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
      transition: all 0.15s;
    }

    .btn-icon:hover { background: var(--border-color, #f4f4f5); color: var(--text-primary, #18181b); }
    .btn-icon.danger:hover { background: #fee2e2; color: #dc2626; }
    .btn-icon svg { width: 15px; height: 15px; }

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

    .field { margin-bottom: 14px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: 12px; font-weight: 500; color: var(--text-primary, #3f3f46); margin-bottom: 6px; }

    .field input, .field select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #18181b);
    }

    .field input:focus, .field select:focus {
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

    @media (max-width: 768px) {
      .filters { flex-wrap: wrap; }
      .search-box { max-width: 100%; order: -1; width: 100%; }
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editing = signal(false);
  
  searchTerm = '';
  filterDepartment: number | null = null;
  filterStatus: string | null = null;
  
  form: any = { name: '', email: '', position: '', departmentId: null, password: '' };
  editId: number | null = null;

  filteredEmployees = computed(() => {
    let result = this.employees();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(term) || 
        e.email.toLowerCase().includes(term)
      );
    }
    
    if (this.filterDepartment) {
      result = result.filter(e => e.departmentId === this.filterDepartment);
    }
    
    if (this.filterStatus) {
      result = result.filter(e => e.status === this.filterStatus);
    }
    
    return result;
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data) => this.departments.set(data)
    });
  }

  onSearchChange(): void {
    // Trigger computed signal update
  }

  onFilterChange(): void {
    // Trigger computed signal update
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'ON_LEAVE': 'Afastado',
      'TERMINATED': 'Desligado'
    };
    return labels[status] || status;
  }

  openModal(): void {
    this.form = { name: '', email: '', position: '', departmentId: null, password: '' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  edit(emp: Employee): void {
    this.form = { name: emp.name, email: emp.email, position: emp.position, departmentId: emp.departmentId };
    this.editing.set(true);
    this.editId = emp.id;
    this.showModal.set(true);
  }

  delete(emp: Employee): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/employees/${emp.id}`).subscribe({
        next: () => {
          this.toast.success('Funcionário desativado com sucesso');
          this.loadEmployees();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao desativar funcionário')
      });
    }
  }

  save(): void {
    if (!this.form.name || !this.form.email || !this.form.position) {
      this.toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving.set(true);
    
    const data: any = { 
      name: this.form.name, 
      email: this.form.email, 
      position: this.form.position, 
      departmentId: this.form.departmentId 
    };
    
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/employees/${this.editId}`, data).subscribe({
        next: () => { 
          this.toast.success('Funcionário atualizado com sucesso');
          this.closeModal(); 
          this.loadEmployees();
          this.saving.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Erro ao atualizar funcionário');
          this.saving.set(false);
        }
      });
    } else {
      this.http.post(`${this.API_URL}/employees?password=${this.form.password}`, data).subscribe({
        next: () => { 
          this.toast.success('Funcionário criado com sucesso');
          this.closeModal(); 
          this.loadEmployees();
          this.saving.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Erro ao criar funcionário');
          this.saving.set(false);
        }
      });
    }
  }

  exportPdf(): void {
    this.http.get(`${this.API_URL}/reports/export/employees/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funcionarios_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('PDF exportado com sucesso');
      },
      error: () => this.toast.error('Erro ao exportar PDF')
    });
  }
}
