import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface JobPosition {
  id: number;
  title: string;
  description: string;
  department: { id: number; name: string } | null;
  type: string;
  status: string;
  salary: number;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Vagas</h1>
          <p>{{ jobs().length }} vagas cadastradas</p>
        </div>
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Vaga
        </button>
      </header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (jobs().length === 0) {
        <div class="card">
          <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            <span>Nenhuma vaga cadastrada</span>
          </div>
        </div>
      } @else {
        <div class="grid">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-header">
                <div class="job-title">
                  <h3>{{ job.title }}</h3>
                  <span class="job-dept">{{ job.department?.name || 'Sem departamento' }}</span>
                </div>
                <span class="badge" [class]="job.status.toLowerCase()">
                  {{ job.status === 'OPEN' ? 'Aberta' : 'Fechada' }}
                </span>
              </div>
              <p class="job-desc">{{ job.description || 'Sem descrição' }}</p>
              <div class="job-meta">
                <span class="job-type">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  {{ getTypeLabel(job.type) }}
                </span>
              </div>
              <div class="job-footer">
                <button class="btn-icon" (click)="edit(job)" title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-icon danger" (click)="delete(job)" title="Excluir">
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
            <h2>{{ editing() ? 'Editar' : 'Nova' }} Vaga</h2>
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
                <label>Título</label>
                <input type="text" [(ngModel)]="form.title" name="title" required placeholder="Ex: Desenvolvedor Frontend"/>
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
              <div class="field">
                <label>Tipo</label>
                <select [(ngModel)]="form.type" name="type" required>
                  <option value="FULL_TIME">Tempo Integral</option>
                  <option value="PART_TIME">Meio Período</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="INTERNSHIP">Estágio</option>
                </select>
              </div>
              <div class="field">
                <label>Descrição</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" placeholder="Descrição da vaga..."></textarea>
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
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .job-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      padding: 16px;
      transition: border-color 0.15s;
    }

    .job-card:hover { border-color: #e4e4e7; }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .job-title h3 { font-size: 14px; font-weight: 600; color: #18181b; margin: 0; }
    .job-dept { font-size: 12px; color: #7c3aed; }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge.open { background: #dcfce7; color: #16a34a; }
    .badge.closed { background: #fee2e2; color: #dc2626; }

    .job-desc {
      font-size: 13px;
      color: #71717a;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-meta { margin-bottom: 12px; }

    .job-type {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #71717a;
    }

    .job-type svg { width: 14px; height: 14px; }

    .job-footer {
      display: flex;
      gap: 4px;
      padding-top: 12px;
      border-top: 1px solid #f4f4f5;
    }

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
export class JobListComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  jobs = signal<JobPosition[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  
  form: any = { title: '', description: '', departmentId: null, type: 'FULL_TIME' };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadDepartments();
  }

  loadJobs(): void {
    this.http.get<JobPosition[]>(`${this.API_URL}/jobs`).subscribe({
      next: (data) => { this.jobs.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data) => this.departments.set(data)
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'FULL_TIME': 'Tempo Integral',
      'PART_TIME': 'Meio Período',
      'CONTRACT': 'Contrato',
      'INTERNSHIP': 'Estágio'
    };
    return labels[type] || type;
  }

  openModal(): void {
    this.form = { title: '', description: '', departmentId: null, type: 'FULL_TIME' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  edit(job: JobPosition): void {
    this.form = { title: job.title, description: job.description, departmentId: job.department?.id, type: job.type };
    this.editing.set(true);
    this.editId = job.id;
    this.showModal.set(true);
  }

  delete(job: JobPosition): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/jobs/${job.id}`).subscribe({ next: () => this.loadJobs() });
    }
  }

  save(): void {
    const data = { title: this.form.title, description: this.form.description, department: { id: this.form.departmentId }, type: this.form.type, status: 'OPEN' };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/jobs/${this.editId}`, data).subscribe({ next: () => { this.closeModal(); this.loadJobs(); } });
    } else {
      this.http.post(`${this.API_URL}/jobs`, data).subscribe({ next: () => { this.closeModal(); this.loadJobs(); } });
    }
  }
}
