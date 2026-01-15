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
    <div class="page">
      <header class="header">
        <div>
          <h1>Departamentos</h1>
          <p>{{ departments().length }} departamentos</p>
        </div>
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar
        </button>
      </header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (departments().length === 0) {
        <div class="card">
          <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span>Nenhum departamento cadastrado</span>
          </div>
        </div>
      } @else {
        <div class="grid">
          @for (dept of departments(); track dept.id) {
            <div class="dept-card">
              <div class="dept-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div class="dept-info">
                <h3>{{ dept.name }}</h3>
                <p>{{ dept.description || 'Sem descrição' }}</p>
              </div>
              <div class="dept-actions">
                <button class="btn-icon" (click)="edit(dept)" title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-icon danger" (click)="delete(dept)" title="Excluir">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Departamento</h2>
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
                <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Ex: Recursos Humanos"/>
              </div>
              <div class="field">
                <label>Descrição</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" placeholder="Descrição do departamento..."></textarea>
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

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .dept-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: border-color 0.15s;
    }

    .dept-card:hover { border-color: #e4e4e7; }

    .dept-icon {
      width: 40px;
      height: 40px;
      background: #f5f3ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7c3aed;
      flex-shrink: 0;
    }

    .dept-icon svg { width: 20px; height: 20px; }

    .dept-info { flex: 1; min-width: 0; }
    .dept-info h3 { font-size: 14px; font-weight: 600; color: #18181b; margin: 0 0 4px; }
    .dept-info p { font-size: 12px; color: #71717a; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .dept-actions { display: flex; gap: 4px; }

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
      color: #71717a;
    }

    .btn-icon:hover { background: #f4f4f5; color: #18181b; }
    .btn-icon.danger:hover { background: #fee2e2; color: #dc2626; }
    .btn-icon svg { width: 14px; height: 14px; }

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
      max-width: 400px;
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

    .field { margin-bottom: 14px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: 12px; font-weight: 500; color: #3f3f46; margin-bottom: 6px; }

    .field input, .field textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: none;
    }

    .field input:focus, .field textarea:focus {
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
export class DepartmentListComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  
  form: any = { name: '', description: '' };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadDepartments(); }

  loadDepartments(): void {
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data) => { this.departments.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.form = { name: '', description: '' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  edit(dept: Department): void {
    this.form = { name: dept.name, description: dept.description };
    this.editing.set(true);
    this.editId = dept.id;
    this.showModal.set(true);
  }

  delete(dept: Department): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/departments/${dept.id}`).subscribe({ next: () => this.loadDepartments() });
    }
  }

  save(): void {
    const data = { name: this.form.name, description: this.form.description };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/departments/${this.editId}`, data).subscribe({ next: () => { this.closeModal(); this.loadDepartments(); } });
    } else {
      this.http.post(`${this.API_URL}/departments`, data).subscribe({ next: () => { this.closeModal(); this.loadDepartments(); } });
    }
  }
}
