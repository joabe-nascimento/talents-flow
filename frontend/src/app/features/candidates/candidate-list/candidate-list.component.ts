import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '@core/services/candidate.service';
import { JobService } from '@core/services/job.service';
import { Candidate, CandidateStatus, JobPosition } from '@core/models';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Candidatos</h1>
          <p>Gerencie os candidatos às vagas</p>
        </div>
        @if (authService.isHR()) {
          <button class="btn btn-primary" (click)="openModal()">
            + Novo Candidato
          </button>
        }
      </div>

      <div class="card">
        <div class="table-container">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
            </div>
          } @else if (candidates().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📋</span>
              <p>Nenhum candidato cadastrado</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Vaga</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (cand of candidates(); track cand.id) {
                  <tr>
                    <td>
                      <div class="d-flex align-center gap-2">
                        <div class="avatar">{{ getInitials(cand.name) }}</div>
                        <div>
                          <div>{{ cand.name }}</div>
                          @if (cand.linkedinUrl) {
                            <a [href]="cand.linkedinUrl" target="_blank" class="linkedin-link">LinkedIn</a>
                          }
                        </div>
                      </div>
                    </td>
                    <td>{{ cand.email }}</td>
                    <td>{{ cand.phone || '-' }}</td>
                    <td>{{ cand.jobPositionTitle || '-' }}</td>
                    <td>
                      <select 
                        class="status-select"
                        [class]="'status-' + getStatusClass(cand.status)"
                        [ngModel]="cand.status"
                        (ngModelChange)="updateStatus(cand.id, $event)"
                        [disabled]="!authService.isHR()">
                        @for (status of statusOptions; track status.value) {
                          <option [value]="status.value">{{ status.label }}</option>
                        }
                      </select>
                    </td>
                    <td>
                      <div class="actions">
                        @if (authService.isHR()) {
                          <button class="btn btn-icon" title="Editar" (click)="edit(cand)">✏️</button>
                          <button class="btn btn-icon" title="Excluir" (click)="delete(cand)">🗑️</button>
                        }
                      </div>
                    </td>
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
              <h2>{{ editing() ? 'Editar' : 'Novo' }} Candidato</h2>
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
              <div class="form-row">
                <div class="form-group">
                  <label>Telefone</label>
                  <input class="form-control" [(ngModel)]="form.phone" name="phone" />
                </div>
                <div class="form-group">
                  <label>Vaga</label>
                  <select class="form-control" [(ngModel)]="form.jobPositionId" name="jobPositionId">
                    <option [ngValue]="null">Selecione...</option>
                    @for (job of jobs(); track job.id) {
                      <option [ngValue]="job.id">{{ job.title }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>LinkedIn</label>
                <input class="form-control" [(ngModel)]="form.linkedinUrl" name="linkedinUrl" placeholder="https://linkedin.com/in/..." />
              </div>
              <div class="form-group">
                <label>Observações</label>
                <textarea class="form-control" [(ngModel)]="form.notes" name="notes" rows="3"></textarea>
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
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .linkedin-link {
      font-size: 0.75rem;
      color: #0077b5;
    }

    .status-select {
      padding: 0.375rem 0.5rem;
      border-radius: 9999px;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;

      &.status-success { background: #d1fae5; color: #065f46; }
      &.status-warning { background: #fef3c7; color: #92400e; }
      &.status-info { background: #dbeafe; color: #1e40af; }
      &.status-danger { background: #fee2e2; color: #991b1b; }
      &.status-gray { background: var(--gray-100); color: var(--gray-600); }
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

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class CandidateListComponent implements OnInit {
  candidates = signal<Candidate[]>([]);
  jobs = signal<JobPosition[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  saving = signal(false);
  
  form: Partial<Candidate> = this.getEmptyForm();

  statusOptions = [
    { value: CandidateStatus.APPLIED, label: 'Aplicado' },
    { value: CandidateStatus.SCREENING, label: 'Triagem' },
    { value: CandidateStatus.INTERVIEW_SCHEDULED, label: 'Entrevista Agendada' },
    { value: CandidateStatus.INTERVIEWED, label: 'Entrevistado' },
    { value: CandidateStatus.OFFER_SENT, label: 'Proposta Enviada' },
    { value: CandidateStatus.HIRED, label: 'Contratado' },
    { value: CandidateStatus.REJECTED, label: 'Rejeitado' },
    { value: CandidateStatus.WITHDRAWN, label: 'Desistiu' }
  ];

  constructor(
    private candidateService: CandidateService,
    private jobService: JobService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.candidateService.getAll().subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.jobService.getAll().subscribe({
      next: (data) => this.jobs.set(data)
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

  edit(cand: Candidate): void {
    this.form = { ...cand };
    this.editing.set(true);
    this.showModal.set(true);
  }

  save(): void {
    this.saving.set(true);
    
    const obs = this.editing() 
      ? this.candidateService.update(this.form.id!, this.form)
      : this.candidateService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => this.saving.set(false)
    });
  }

  updateStatus(id: number, status: CandidateStatus): void {
    this.candidateService.updateStatus(id, status).subscribe({
      next: () => this.loadData()
    });
  }

  delete(cand: Candidate): void {
    if (confirm(`Deseja excluir o candidato ${cand.name}?`)) {
      this.candidateService.delete(cand.id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getStatusClass(status: CandidateStatus): string {
    const classes: Record<CandidateStatus, string> = {
      [CandidateStatus.APPLIED]: 'gray',
      [CandidateStatus.SCREENING]: 'info',
      [CandidateStatus.INTERVIEW_SCHEDULED]: 'warning',
      [CandidateStatus.INTERVIEWED]: 'info',
      [CandidateStatus.OFFER_SENT]: 'warning',
      [CandidateStatus.HIRED]: 'success',
      [CandidateStatus.REJECTED]: 'danger',
      [CandidateStatus.WITHDRAWN]: 'gray'
    };
    return classes[status] || 'gray';
  }

  private getEmptyForm(): Partial<Candidate> {
    return {
      name: '',
      email: '',
      phone: '',
      jobPositionId: undefined,
      linkedinUrl: '',
      notes: ''
    };
  }
}

