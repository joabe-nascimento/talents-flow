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
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Vagas</h1>
          <p>Gerencie as vagas disponíveis</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          + Nova Vaga
        </button>
      </div>

      <div class="jobs-grid">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        } @else if (jobs().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">💼</span>
            <p>Nenhuma vaga cadastrada</p>
          </div>
        } @else {
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <span class="status-badge" [class]="'status-' + job.status.toLowerCase()">{{ job.status }}</span>
              </div>
              <p class="job-dept">{{ job.department?.name }}</p>
              <p class="job-desc">{{ job.description || 'Sem descrição' }}</p>
              <div class="job-footer">
                <span class="job-type">{{ job.type }}</span>
                <div class="job-actions">
                  <button class="btn btn-icon" (click)="edit(job)">✏️</button>
                  <button class="btn btn-icon" (click)="delete(job)">🗑️</button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Nova' }} Vaga</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="save()">
            <div class="form-group">
              <label>Título</label>
              <input type="text" [(ngModel)]="form.title" name="title" required />
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
            <div class="form-group">
              <label>Tipo</label>
              <select [(ngModel)]="form.type" name="type" required>
                <option value="FULL_TIME">Tempo Integral</option>
                <option value="PART_TIME">Meio Período</option>
                <option value="CONTRACT">Contrato</option>
                <option value="INTERNSHIP">Estágio</option>
              </select>
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
    .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .job-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .job-header h3 { margin: 0; font-size: 1.125rem; }
    .job-dept { color: #3b82f6; margin: 0.5rem 0; font-weight: 500; }
    .job-desc { color: #64748b; margin: 0.5rem 0; }
    .job-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .job-type { color: #64748b; font-size: 0.875rem; }
    .job-actions { display: flex; gap: 0.5rem; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; }
    .status-open { background: #dcfce7; color: #166534; }
    .status-closed { background: #fee2e2; color: #991b1b; }
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
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; }
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
      next: (data: JobPosition[]) => { this.jobs.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data: Department[]) => this.departments.set(data)
    });
  }

  openModal(): void {
    this.form = { title: '', description: '', departmentId: null, type: 'FULL_TIME' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(job: JobPosition): void {
    this.form = { title: job.title, description: job.description, departmentId: job.department?.id, type: job.type };
    this.editing.set(true);
    this.editId = job.id;
    this.showModal.set(true);
  }

  delete(job: JobPosition): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/jobs/${job.id}`).subscribe({
        next: () => this.loadJobs()
      });
    }
  }

  save(): void {
    const data = { title: this.form.title, description: this.form.description, department: { id: this.form.departmentId }, type: this.form.type, status: 'OPEN' };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/jobs/${this.editId}`, data).subscribe({
        next: () => { this.closeModal(); this.loadJobs(); }
      });
    } else {
      this.http.post(`${this.API_URL}/jobs`, data).subscribe({
        next: () => { this.closeModal(); this.loadJobs(); }
      });
    }
  }
}
