import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: { id: number; name: string } | null;
  status: string;
  hireDate: string;
}

interface Department {
  id: number;
  name: string;
}

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
        <button class="btn btn-primary" (click)="openModal()">
          + Novo Funcionário
        </button>
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (emp of employees(); track emp.id) {
                  <tr>
                    <td>{{ emp.name }}</td>
                    <td>{{ emp.email }}</td>
                    <td>{{ emp.position }}</td>
                    <td>{{ emp.department?.name || '-' }}</td>
                    <td>
                      <span class="status-badge" [class]="'status-' + emp.status.toLowerCase()">
                        {{ emp.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-icon" (click)="edit(emp)">✏️</button>
                      <button class="btn btn-icon" (click)="delete(emp)">🗑️</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Funcionário</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="save()">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" [(ngModel)]="form.name" name="name" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" required />
            </div>
            <div class="form-group">
              <label>Cargo</label>
              <input type="text" [(ngModel)]="form.position" name="position" required />
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <select [(ngModel)]="form.departmentId" name="departmentId" required>
                <option [ngValue]="null">Selecione...</option>
                @for (dept of departments(); track dept.id) {
                  <option [ngValue]="dept.id">{{ dept.name }}</option>
                }
              </select>
            </div>
            @if (!editing()) {
              <div class="form-group">
                <label>Senha</label>
                <input type="password" [(ngModel)]="form.password" name="password" required />
              </div>
            }
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .card { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; border: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-icon { background: transparent; padding: 0.25rem; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-inactive { background: #fee2e2; color: #991b1b; }
    .loading-state, .empty-state { padding: 3rem; text-align: center; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 0.75rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .modal form { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; }
  `]
})
export class EmployeeListComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  
  form: any = { name: '', email: '', position: '', departmentId: null, password: '' };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data: Employee[]) => { this.employees.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data: Department[]) => this.departments.set(data)
    });
  }

  openModal(): void {
    this.form = { name: '', email: '', position: '', departmentId: null, password: '' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(emp: Employee): void {
    this.form = { name: emp.name, email: emp.email, position: emp.position, departmentId: emp.department?.id };
    this.editing.set(true);
    this.editId = emp.id;
    this.showModal.set(true);
  }

  delete(emp: Employee): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/employees/${emp.id}`).subscribe({
        next: () => this.loadEmployees()
      });
    }
  }

  save(): void {
    const data = { name: this.form.name, email: this.form.email, position: this.form.position, department: { id: this.form.departmentId } };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/employees/${this.editId}`, data).subscribe({
        next: () => { this.closeModal(); this.loadEmployees(); }
      });
    } else {
      this.http.post(`${this.API_URL}/employees?password=${this.form.password}`, data).subscribe({
        next: () => { this.closeModal(); this.loadEmployees(); }
      });
    }
  }
}
