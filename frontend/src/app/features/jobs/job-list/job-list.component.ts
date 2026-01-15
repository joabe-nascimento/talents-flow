import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '@core/services/job.service';
import { DepartmentService } from '@core/services/department.service';
import { JobPosition, JobStatus, JobType, Department } from '@core/models';
import { AuthService } from '@core/services/auth.service';

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
        @if (authService.isHR()) {
          <button class="btn btn-primary" (click)="openModal()">
            + Nova Vaga
          </button>
        }
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
                <span [class]="'badge badge-' + getStatusClass(job.status)">
                  {{ getStatusLabel(job.status) }}
                </span>
                @if (authService.isHR()) {
                  <div class="job-actions">
                    <button class="btn btn-icon" (click)="edit(job)">✏️</button>
                    <button class="btn btn-icon" (click)="delete(job)">🗑️</button>
                  </div>
                }
              </div>
              <h3>{{ job.title }}</h3>
              <p class="job-department">{{ job.departmentName || 'Geral' }}</p>
              <p class="job-description">{{ job.description || 'Sem descrição' }}</p>
              <div class="job-meta">
                <span class="job-type">{{ getTypeLabel(job.type) }}</span>
                @if (job.salaryMin || job.salaryMax) {
                  <span class="job-salary">
                    R$ {{ job.salaryMin | number:'1.0-0' }} - {{ job.salaryMax | number:'1.0-0' }}
                  </span>
                }
              </div>
              <div class="job-footer">
                <span class="candidates-count">
                  📋 {{ job.candidateCount || 0 }} candidatos
                </span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editing() ? 'Editar' : 'Nova' }} Vaga</h2>
              <button class="btn btn-icon" (click)="closeModal()">✕</button>
            </div>
            <form class="modal-body" (ngSubmit)="save()">
              <div class="form-row">
                <div class="form-group">
                  <label>Título *</label>
                  <input class="form-control" [(ngModel)]="form.title" name="title" required />
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
              <div class="form-group">
                <label>Descrição</label>
                <textarea class="form-control" [(ngModel)]="form.description" name="description" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Requisitos</label>
                <textarea class="form-control" [(ngModel)]="form.requirements" name="requirements" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Tipo</label>
                  <select class="form-control" [(ngModel)]="form.type" name="type">
                    <option value="FULL_TIME">Tempo Integral</option>
                    <option value="PART_TIME">Meio Período</option>
                    <option value="CONTRACT">Contrato</option>
                    <option value="INTERNSHIP">Estágio</option>
                    <option value="REMOTE">Remoto</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <select class="form-control" [(ngModel)]="form.status" name="status">
                    <option value="OPEN">Aberta</option>
                    <option value="CLOSED">Fechada</option>
                    <option value="ON_HOLD">Em Espera</option>
                    <option value="FILLED">Preenchida</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Salário Mínimo</label>
                  <input class="form-control" type="number" [(ngModel)]="form.salaryMin" name="salaryMin" />
                </div>
                <div class="form-group">
                  <label>Salário Máximo</label>
                  <input class="form-control" type="number" [(ngModel)]="form.salaryMax" name="salaryMax" />
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
      grid-column: 1 / -1;
      padding: 3rem;
      text-align: center;
      color: var(--gray-500);
    }

    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    .job-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      h3 {
        margin: 0.75rem 0 0.25rem;
        font-size: 1.125rem;
      }
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .job-actions { display: flex; gap: 0.25rem; }

    .job-department {
      color: var(--gray-500);
      font-size: 0.875rem;
      margin: 0 0 0.75rem;
    }

    .job-description {
      color: var(--gray-600);
      font-size: 0.9375rem;
      margin-bottom: 1rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;

      .job-type {
        color: var(--primary);
        font-weight: 500;
      }

      .job-salary {
        color: var(--gray-600);
      }
    }

    .job-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
      font-size: 0.875rem;
      color: var(--gray-500);
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
      max-width: 600px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 60px;
    }
  `]
})
export class JobListComponent implements OnInit {
  jobs = signal<JobPosition[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  saving = signal(false);
  
  form: Partial<JobPosition> = this.getEmptyForm();

  constructor(
    private jobService: JobService,
    private departmentService: DepartmentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.jobService.getAll().subscribe({
      next: (data) => {
        this.jobs.set(data);
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

  edit(job: JobPosition): void {
    this.form = { ...job };
    this.editing.set(true);
    this.showModal.set(true);
  }

  save(): void {
    this.saving.set(true);
    
    const obs = this.editing() 
      ? this.jobService.update(this.form.id!, this.form)
      : this.jobService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => this.saving.set(false)
    });
  }

  delete(job: JobPosition): void {
    if (confirm(`Deseja excluir a vaga ${job.title}?`)) {
      this.jobService.delete(job.id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  getStatusClass(status: JobStatus): string {
    const classes: Record<JobStatus, string> = {
      [JobStatus.OPEN]: 'success',
      [JobStatus.CLOSED]: 'danger',
      [JobStatus.ON_HOLD]: 'warning',
      [JobStatus.FILLED]: 'info'
    };
    return classes[status] || 'gray';
  }

  getStatusLabel(status: JobStatus): string {
    const labels: Record<JobStatus, string> = {
      [JobStatus.OPEN]: 'Aberta',
      [JobStatus.CLOSED]: 'Fechada',
      [JobStatus.ON_HOLD]: 'Em Espera',
      [JobStatus.FILLED]: 'Preenchida'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: JobType): string {
    const labels: Record<JobType, string> = {
      [JobType.FULL_TIME]: 'Tempo Integral',
      [JobType.PART_TIME]: 'Meio Período',
      [JobType.CONTRACT]: 'Contrato',
      [JobType.INTERNSHIP]: 'Estágio',
      [JobType.REMOTE]: 'Remoto'
    };
    return labels[type] || type;
  }

  private getEmptyForm(): Partial<JobPosition> {
    return {
      title: '',
      description: '',
      requirements: '',
      departmentId: undefined,
      type: JobType.FULL_TIME,
      status: JobStatus.OPEN
    };
  }
}

