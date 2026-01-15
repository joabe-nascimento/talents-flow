import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobPosition: { id: number; title: string } | null;
  status: string;
  appliedAt: string;
}

interface JobPosition {
  id: number;
  title: string;
}

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
        <button class="btn btn-primary" (click)="openModal()">
          + Novo Candidato
        </button>
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
                @for (c of candidates(); track c.id) {
                  <tr>
                    <td>{{ c.name }}</td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.phone || '-' }}</td>
                    <td>{{ c.jobPosition?.title || '-' }}</td>
                    <td>
                      <span class="status-badge" [class]="'status-' + c.status.toLowerCase()">
                        {{ c.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-icon" (click)="edit(c)">✏️</button>
                      <button class="btn btn-icon" (click)="delete(c)">🗑️</button>
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
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Candidato</h2>
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
              <label>Telefone</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone" />
            </div>
            <div class="form-group">
              <label>Vaga</label>
              <select [(ngModel)]="form.jobPositionId" name="jobPositionId" required>
                <option [ngValue]="null">Selecione...</option>
                @for (job of jobs(); track job.id) {
                  <option [ngValue]="job.id">{{ job.title }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="form.status" name="status" required>
                <option value="NEW">Novo</option>
                <option value="SCREENING">Triagem</option>
                <option value="INTERVIEW">Entrevista</option>
                <option value="HIRED">Contratado</option>
                <option value="REJECTED">Rejeitado</option>
              </select>
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
    .status-new { background: #dbeafe; color: #1e40af; }
    .status-screening { background: #fef3c7; color: #92400e; }
    .status-interview { background: #e0e7ff; color: #3730a3; }
    .status-hired { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .loading-state, .empty-state { padding: 3rem; text-align: center; }
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
    .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; }
  `]
})
export class CandidateListComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  candidates = signal<Candidate[]>([]);
  jobs = signal<JobPosition[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal(false);
  
  form: any = { name: '', email: '', phone: '', jobPositionId: null, status: 'NEW' };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadJobs();
  }

  loadCandidates(): void {
    this.http.get<Candidate[]>(`${this.API_URL}/candidates`).subscribe({
      next: (data: Candidate[]) => { this.candidates.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadJobs(): void {
    this.http.get<JobPosition[]>(`${this.API_URL}/jobs`).subscribe({
      next: (data: JobPosition[]) => this.jobs.set(data)
    });
  }

  openModal(): void {
    this.form = { name: '', email: '', phone: '', jobPositionId: null, status: 'NEW' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  edit(c: Candidate): void {
    this.form = { name: c.name, email: c.email, phone: c.phone, jobPositionId: c.jobPosition?.id, status: c.status };
    this.editing.set(true);
    this.editId = c.id;
    this.showModal.set(true);
  }

  delete(c: Candidate): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/candidates/${c.id}`).subscribe({
        next: () => this.loadCandidates()
      });
    }
  }

  save(): void {
    const data = { name: this.form.name, email: this.form.email, phone: this.form.phone, jobPosition: { id: this.form.jobPositionId }, status: this.form.status };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/candidates/${this.editId}`, data).subscribe({
        next: () => { this.closeModal(); this.loadCandidates(); }
      });
    } else {
      this.http.post(`${this.API_URL}/candidates`, data).subscribe({
        next: () => { this.closeModal(); this.loadCandidates(); }
      });
    }
  }
}
