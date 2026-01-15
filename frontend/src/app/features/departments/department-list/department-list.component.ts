import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '@core/services/department.service';
import { Department } from '@core/models';
import { AuthService } from '@core/services/auth.service';

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
        @if (authService.isHR()) {
          <button class="btn btn-primary" (click)="openModal()">
            + Novo Departamento
          </button>
        }
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
                @if (authService.isHR()) {
                  <div class="dept-actions">
                    <button class="btn btn-icon" (click)="edit(dept)">✏️</button>
                    <button class="btn btn-icon" (click)="delete(dept)">🗑️</button>
                  </div>
                }
              </div>
              <p class="dept-description">{{ dept.description || 'Sem descrição' }}</p>
              <div class="dept-footer">
                <div class="dept-stat">
                  <span class="stat-value">{{ dept.employeeCount || 0 }}</span>
                  <span class="stat-label">Funcionários</span>
                </div>
                <div class="dept-manager">
                  @if (dept.managerName) {
                    <span class="manager-label">Gerente:</span>
                    <span class="manager-name">{{ dept.managerName }}</span>
                  } @else {
                    <span class="no-manager">Sem gerente definido</span>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editing() ? 'Editar' : 'Novo' }} Departamento</h2>
              <button class="btn btn-icon" (click)="closeModal()">✕</button>
            </div>
            <form class="modal-body" (ngSubmit)="save()">
              <div class="form-group">
                <label>Nome *</label>
                <input class="form-control" [(ngModel)]="form.name" name="name" required />
              </div>
              <div class="form-group">
                <label>Descrição</label>
                <textarea class="form-control" [(ngModel)]="form.description" name="description" rows="3"></textarea>
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
      grid-column: 1 / -1;
      padding: 3rem;
      text-align: center;
      color: var(--gray-500);
    }

    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    .departments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .dept-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;

      h3 { margin: 0; font-size: 1.125rem; }
    }

    .dept-actions { display: flex; gap: 0.25rem; }

    .dept-description {
      color: var(--gray-500);
      font-size: 0.9375rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .dept-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .dept-stat {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
      }

      .stat-label {
        font-size: 0.75rem;
        color: var(--gray-500);
      }
    }

    .dept-manager {
      text-align: right;
      font-size: 0.875rem;

      .manager-label { color: var(--gray-500); }
      .manager-name { font-weight: 500; margin-left: 0.25rem; }
      .no-manager { color: var(--gray-400); font-style: italic; }
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
      max-width: 480px;
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

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class DepartmentListComponent implements OnInit {
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  saving = signal(false);
  
  form: Partial<Department> = { name: '', description: '' };

  constructor(
    private departmentService: DepartmentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.form = { name: '', description: '' };
    this.editing.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(dept: Department): void {
    this.form = { ...dept };
    this.editing.set(true);
    this.showModal.set(true);
  }

  save(): void {
    this.saving.set(true);
    
    const obs = this.editing() 
      ? this.departmentService.update(this.form.id!, this.form)
      : this.departmentService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => this.saving.set(false)
    });
  }

  delete(dept: Department): void {
    if (confirm(`Deseja excluir o departamento ${dept.name}?`)) {
      this.departmentService.delete(dept.id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert(err.error?.message || 'Erro ao excluir')
      });
    }
  }
}

