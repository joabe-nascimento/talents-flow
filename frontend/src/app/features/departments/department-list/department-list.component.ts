import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Department {
  id: number;
  name: string;
  description: string;
  employeeCount?: number;
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Departamentos</h1>
          <p>Gerencie os departamentos da empresa</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          + Novo Departamento
        </button>
      </div>

      <div class="departments-grid">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        } @else if (departments().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🏢</span>
            <p>Nenhum departamento cadastrado</p>
          </div>
        } @else {
          @for (dept of departments(); track dept.id) {
            <div class="dept-card">
              <div class="dept-header">
                <h3>{{ dept.name }}</h3>
                <div class="dept-actions">
                  <button class="btn btn-icon" (click)="edit(dept)">✏️</button>
                  <button class="btn btn-icon" (click)="delete(dept)">🗑️</button>
                </div>
              </div>
              <p class="dept-description">{{ dept.description || 'Sem descrição' }}</p>
            </div>
          }
        }
      </div>
    </div>

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Departamento</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="save()">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" [(ngModel)]="form.name" name="name" required />
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3"></textarea>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .departments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .dept-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .dept-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .dept-header h3 { margin: 0; font-size: 1.125rem; }
    .dept-actions { display: flex; gap: 0.5rem; }
    .dept-description { color: #64748b; margin: 0.75rem 0 0; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; border: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-icon { background: transparent; padding: 0.25rem; }
    .loading-state, .empty-state { grid-column: 1 / -1; padding: 3rem; text-align: center; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 0.75rem; width: 100%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .modal form { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; }
  `]
})
export class DepartmentListComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api/departments';
  
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  
  form = { name: '', description: '' };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.http.get<Department[]>(this.API_URL).subscribe({
      next: (data: Department[]) => { this.departments.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.form = { name: '', description: '' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(dept: Department): void {
    this.form = { name: dept.name, description: dept.description };
    this.editing.set(true);
    this.editId = dept.id;
    this.showModal.set(true);
  }

  delete(dept: Department): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/${dept.id}`).subscribe({
        next: () => this.loadDepartments(),
        error: (err: any) => alert(err.error?.message || 'Erro ao excluir')
      });
    }
  }

  save(): void {
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/${this.editId}`, this.form).subscribe({
        next: () => { this.closeModal(); this.loadDepartments(); }
      });
    } else {
      this.http.post(this.API_URL, this.form).subscribe({
        next: () => { this.closeModal(); this.loadDepartments(); }
      });
    }
  }
}
