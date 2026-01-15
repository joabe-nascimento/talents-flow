import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Candidatos</h1>
          <p>{{ candidates().length }} candidatos</p>
        </div>
        <div class="header-actions">
          <a routerLink="/dashboard/pipeline" class="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Pipeline
          </a>
          <button class="btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar
          </button>
        </div>
      </header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          @if (candidates().length === 0) {
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
              <span>Nenhum candidato cadastrado</span>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Vaga</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (c of candidates(); track c.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="avatar">{{ getInitials(c.name) }}</div>
                        <div>
                          <span class="name">{{ c.name }}</span>
                          <span class="email">{{ c.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ c.jobPosition?.title || '-' }}</td>
                    <td>
                      <span class="badge" [class]="c.status.toLowerCase()">
                        {{ getStatusLabel(c.status) }}
                      </span>
                    </td>
                    <td class="date">{{ formatDate(c.appliedAt) }}</td>
                    <td>
                      <div class="actions">
                        <button class="btn-icon" (click)="edit(c)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button class="btn-icon danger" (click)="delete(c)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : 'Novo' }} Candidato</h2>
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
                <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Nome completo"/>
              </div>
              <div class="field">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" required placeholder="email@exemplo.com"/>
              </div>
              <div class="field">
                <label>Telefone</label>
                <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="(00) 00000-0000"/>
              </div>
              <div class="field">
                <label>Vaga</label>
                <select [(ngModel)]="form.jobPositionId" name="jobPositionId" required>
                  <option [ngValue]="null">Selecione...</option>
                  @for (job of jobs(); track job.id) {
                    <option [ngValue]="job.id">{{ job.title }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Status</label>
                <select [(ngModel)]="form.status" name="status" required>
                  <option value="NEW">Novo</option>
                  <option value="SCREENING">Triagem</option>
                  <option value="INTERVIEW">Entrevista</option>
                  <option value="HIRED">Contratado</option>
                  <option value="REJECTED">Rejeitado</option>
                </select>
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

    .header-actions { display: flex; gap: 8px; }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-primary { background: #7c3aed; color: white; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-secondary { background: #f4f4f5; color: #3f3f46; }
    .btn-secondary:hover { background: #e4e4e7; }
    .btn-primary svg, .btn-secondary svg { width: 16px; height: 16px; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      overflow: hidden;
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

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; }
    th { font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; background: #fafafa; border-bottom: 1px solid #f4f4f5; }
    td { font-size: 13px; color: #3f3f46; border-bottom: 1px solid #f4f4f5; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #fafafa; }

    .user-cell { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }

    .name { display: block; font-weight: 500; color: #18181b; }
    .email { display: block; font-size: 12px; color: #71717a; }
    .date { font-size: 12px; color: #71717a; }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge.new { background: #dbeafe; color: #1e40af; }
    .badge.screening { background: #fef3c7; color: #92400e; }
    .badge.interview { background: #f3e8ff; color: #7c3aed; }
    .badge.hired { background: #dcfce7; color: #16a34a; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }

    .actions { display: flex; gap: 4px; }

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
    .btn-icon svg { width: 15px; height: 15px; }

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

    .field input, .field select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      font-size: 13px;
    }

    .field input:focus, .field select:focus {
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
      next: (data) => { this.candidates.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadJobs(): void {
    this.http.get<JobPosition[]>(`${this.API_URL}/jobs`).subscribe({
      next: (data) => this.jobs.set(data)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NEW': 'Novo',
      'SCREENING': 'Triagem',
      'INTERVIEW': 'Entrevista',
      'HIRED': 'Contratado',
      'REJECTED': 'Rejeitado'
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  openModal(): void {
    this.form = { name: '', email: '', phone: '', jobPositionId: null, status: 'NEW' };
    this.editing.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  edit(c: Candidate): void {
    this.form = { name: c.name, email: c.email, phone: c.phone, jobPositionId: c.jobPosition?.id, status: c.status };
    this.editing.set(true);
    this.editId = c.id;
    this.showModal.set(true);
  }

  delete(c: Candidate): void {
    if (confirm('Confirma exclusão?')) {
      this.http.delete(`${this.API_URL}/candidates/${c.id}`).subscribe({ next: () => this.loadCandidates() });
    }
  }

  save(): void {
    const data = { name: this.form.name, email: this.form.email, phone: this.form.phone, jobPosition: { id: this.form.jobPositionId }, status: this.form.status };
    if (this.editing() && this.editId) {
      this.http.put(`${this.API_URL}/candidates/${this.editId}`, data).subscribe({ next: () => { this.closeModal(); this.loadCandidates(); } });
    } else {
      this.http.post(`${this.API_URL}/candidates`, data).subscribe({ next: () => { this.closeModal(); this.loadCandidates(); } });
    }
  }
}
