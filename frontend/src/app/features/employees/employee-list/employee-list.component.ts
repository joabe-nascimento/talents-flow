import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '@core/services/employee.service';
import { DepartmentService } from '@core/services/department.service';
import { Employee, EmployeeStatus, Department, Role } from '@core/models';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Funcionários</h1>
          <p>Gerencie os funcionários da empresa</p>
        </div>
        @if (authService.isHR()) {
          <button class="btn btn-primary" (click)="openModal()">
            + Novo Funcionário
          </button>
        }
      </div>

      <div class="card">
        <div class="table-container">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
            </div>
          } @else if (employees().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">👥</span>
              <p>Nenhum funcionário cadastrado</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Status</th>
                  @if (authService.isHR()) {
                    <th>Ações</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (emp of employees(); track emp.id) {
                  <tr>
                    <td>
                      <div class="d-flex align-center gap-2">
                        <div class="avatar">{{ getInitials(emp.name) }}</div>
                        {{ emp.name }}
                      </div>
                    </td>
                    <td>{{ emp.email }}</td>
                    <td>{{ emp.position }}</td>
                    <td>{{ emp.departmentName || '-' }}</td>
                    <td>
                      <span [class]="'badge badge-' + getStatusClass(emp.status)">
                        {{ getStatusLabel(emp.status) }}
                      </span>
                    </td>
                    @if (authService.isHR()) {
                      <td>
                        <div class="actions">
                          <button class="btn btn-icon" title="Editar" (click)="edit(emp)">✏️</button>
                          <button class="btn btn-icon" title="Excluir" (click)="delete(emp)">🗑️</button>
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editing() ? 'Editar' : 'Novo' }} Funcionário</h2>
              <button class="btn btn-icon" (click)="closeModal()">✕</button>
            </div>
            <form class="modal-body" (ngSubmit)="save()">
              <div class="form-row">
                <div class="form-group">
                  <label>Nome *</label>
                  <input class="form-control" [(ngModel)]="form.name" name="name" required />
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input class="form-control" type="email" [(ngModel)]="form.email" name="email" required />
                </div>
              </div>
              @if (!editing()) {
                <div class="form-group">
                  <label>Senha *</label>
                  <input class="form-control" type="password" [(ngModel)]="form.password" name="password" required />
                </div>
              }
              <div class="form-row">
                <div class="form-group">
                  <label>Cargo *</label>
                  <input class="form-control" [(ngModel)]="form.position" name="position" required />
                </div>
                <div class="form-group">
                  <label>Departamento</label>
                  <select class="form-control" [(ngModel)]="form.departmentId" name="departmentId">
                    <option [ngValue]="null">Selecione...</option>
                    @for (dept of departments(); track dept.id) {
                      <option [ngValue]="dept.id">{{ dept.name }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Telefone</label>
                  <input class="form-control" [(ngModel)]="form.phone" name="phone" />
                </div>
                <div class="form-group">
                  <label>Perfil</label>
                  <select class="form-control" [(ngModel)]="form.role" name="role">
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="MANAGER">Gerente</option>
                    <option value="HR">RH</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { <span class="spinner"></span> }
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;

      h1 { margin: 0 0 0.25rem; }
      p { color: var(--gray-500); margin: 0; }
    }

    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--gray-500);
    }

    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .actions { display: flex; gap: 0.25rem; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-200);

      h2 { margin: 0; font-size: 1.125rem; }
    }

    .modal-body { padding: 1.5rem; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
      margin-top: 1rem;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  saving = signal(false);
  
  form: Partial<Employee> & { password?: string } = this.getEmptyForm();

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.departmentService.getAll().subscribe({
      next: (data) => this.departments.set(data)
    });
  }

  openModal(): void {
    this.form = this.getEmptyForm();
    this.editing.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(emp: Employee): void {
    this.form = { ...emp };
    this.editing.set(true);
    this.showModal.set(true);
  }

  save(): void {
    this.saving.set(true);
    
    const obs = this.editing() 
      ? this.employeeService.update(this.form.id!, this.form)
      : this.employeeService.create(this.form, this.form.password || '');

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => this.saving.set(false)
    });
  }

  delete(emp: Employee): void {
    if (confirm(`Deseja desativar o funcionário ${emp.name}?`)) {
      this.employeeService.delete(emp.id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getStatusClass(status: EmployeeStatus): string {
    const classes: Record<EmployeeStatus, string> = {
      [EmployeeStatus.ACTIVE]: 'success',
      [EmployeeStatus.ON_LEAVE]: 'warning',
      [EmployeeStatus.TERMINATED]: 'danger'
    };
    return classes[status] || 'gray';
  }

  getStatusLabel(status: EmployeeStatus): string {
    const labels: Record<EmployeeStatus, string> = {
      [EmployeeStatus.ACTIVE]: 'Ativo',
      [EmployeeStatus.ON_LEAVE]: 'Afastado',
      [EmployeeStatus.TERMINATED]: 'Desligado'
    };
    return labels[status] || status;
  }

  private getEmptyForm(): Partial<Employee> & { password?: string } {
    return {
      name: '',
      email: '',
      position: '',
      departmentId: undefined,
      phone: '',
      role: Role.EMPLOYEE,
      status: EmployeeStatus.ACTIVE,
      password: ''
    };
  }
}

