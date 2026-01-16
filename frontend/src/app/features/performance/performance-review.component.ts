import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  departmentName: string | null;
}

interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentName: string | null;
  reviewerId: number;
  reviewerName: string;
  reviewDate: string;
  reviewPeriod: string;
  rating: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  comments: string;
  status: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';
  createdAt: string;
}

@Component({
  selector: 'app-performance-review',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Avaliações de Desempenho" 
        [subtitle]="reviews().length + ' avaliações registradas'"
        backLink="/dashboard/management"
        backLabel="Gestão RH">
        <button class="btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Avaliação
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ draftCount() }}</span>
            <span class="stat-label">Rascunhos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ submittedCount() }}</span>
            <span class="stat-label">Submetidas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ acknowledgedCount() }}</span>
            <span class="stat-label">Reconhecidas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ averageRating().toFixed(1) }}</span>
            <span class="stat-label">Média Geral</span>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          @if (reviews().length === 0) {
            <div class="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Nenhuma avaliação cadastrada</span>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Avaliador</th>
                  <th>Período</th>
                  <th>Nota</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (review of reviews(); track review.id) {
                  <tr>
                    <td>
                      <div class="employee-cell">
                        <div class="avatar">{{ getInitials(review.employeeName) }}</div>
                        <div>
                          <span class="name">{{ review.employeeName }}</span>
                          <span class="position">{{ review.employeePosition }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ review.reviewerName }}</td>
                    <td>{{ review.reviewPeriod }}</td>
                    <td>
                      <div class="rating">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg [class.filled]="star <= review.rating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        }
                      </div>
                    </td>
                    <td>
                      <span class="badge" [class]="review.status.toLowerCase()">
                        {{ getStatusLabel(review.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="btn-icon" (click)="viewReview(review)" title="Ver detalhes">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        @if (review.status === 'DRAFT') {
                          <button class="btn-icon" (click)="editReview(review)" title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button class="btn-icon success" (click)="submitReview(review)" title="Submeter">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M22 2L11 13"/>
                              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                          </button>
                        }
                        @if (review.status === 'SUBMITTED') {
                          <button class="btn-icon success" (click)="acknowledgeReview(review)" title="Reconhecer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                          </button>
                        }
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
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing() ? 'Editar' : viewMode() ? 'Detalhes da' : 'Nova' }} Avaliação</h2>
            <button class="btn-close" (click)="closeModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form (ngSubmit)="save()">
            <div class="modal-body">
              <div class="row">
                <div class="field">
                  <label>Funcionário</label>
                  <select [(ngModel)]="form.employeeId" name="employeeId" required [disabled]="viewMode()">
                    <option [ngValue]="null">Selecione...</option>
                    @for (emp of employees(); track emp.id) {
                      <option [ngValue]="emp.id">{{ emp.name }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label>Avaliador</label>
                  <select [(ngModel)]="form.reviewerId" name="reviewerId" required [disabled]="viewMode()">
                    <option [ngValue]="null">Selecione...</option>
                    @for (emp of employees(); track emp.id) {
                      <option [ngValue]="emp.id">{{ emp.name }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <label>Data da Avaliação</label>
                  <input type="date" [(ngModel)]="form.reviewDate" name="reviewDate" required [disabled]="viewMode()"/>
                </div>
                <div class="field">
                  <label>Período de Referência</label>
                  <input type="text" [(ngModel)]="form.reviewPeriod" name="reviewPeriod" placeholder="Ex: Q4 2025" [disabled]="viewMode()"/>
                </div>
              </div>
              <div class="field">
                <label>Nota (1-5)</label>
                <div class="rating-input" [class.disabled]="viewMode()">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" (click)="setRating(star)" [disabled]="viewMode()">
                      <svg [class.filled]="star <= form.rating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  }
                  <span class="rating-label">{{ form.rating }}/5</span>
                </div>
              </div>
              <div class="field">
                <label>Pontos Fortes</label>
                <textarea [(ngModel)]="form.strengths" name="strengths" rows="2" placeholder="Descreva os pontos fortes..." [disabled]="viewMode()"></textarea>
              </div>
              <div class="field">
                <label>Áreas de Melhoria</label>
                <textarea [(ngModel)]="form.areasForImprovement" name="areasForImprovement" rows="2" placeholder="Descreva as áreas de melhoria..." [disabled]="viewMode()"></textarea>
              </div>
              <div class="field">
                <label>Metas</label>
                <textarea [(ngModel)]="form.goals" name="goals" rows="2" placeholder="Defina as metas..." [disabled]="viewMode()"></textarea>
              </div>
              <div class="field">
                <label>Comentários Gerais</label>
                <textarea [(ngModel)]="form.comments" name="comments" rows="2" placeholder="Comentários adicionais..." [disabled]="viewMode()"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">{{ viewMode() ? 'Fechar' : 'Cancelar' }}</button>
              @if (!viewMode()) {
                <button type="submit" class="btn-primary" [disabled]="saving()">
                  {{ saving() ? 'Salvando...' : 'Salvar' }}
                </button>
              }
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

    .header h1 { font-size: 20px; font-weight: 600; color: var(--text-primary, #18181b); margin: 0; }
    .header p { font-size: 13px; color: var(--text-secondary, #71717a); margin: 4px 0 0; }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 120px;
      height: 40px;
      padding: 0 20px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary:hover { background: #6d28d9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary svg { width: 18px; height: 18px; }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 100px;
      height: 40px;
      padding: 0 20px;
      background: var(--border-color, #f4f4f5);
      color: var(--text-primary, #3f3f46);
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-secondary:hover { background: var(--text-muted, #e4e4e7); }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    @media (max-width: 1024px) { .stats { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg { width: 18px; height: 18px; }

    .stat-icon.orange { background: #ffedd5; color: #ea580c; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-icon.purple { background: #f3e8ff; color: #7c3aed; }

    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 20px; font-weight: 600; color: var(--text-primary, #18181b); }
    .stat-label { display: block; font-size: 11px; color: var(--text-secondary, #71717a); }

    /* Loading */
    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid var(--border-color, #e4e4e7); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Card & Table */
    .card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
      overflow: hidden;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: var(--text-muted, #a1a1aa);
    }

    .empty svg { width: 40px; height: 40px; }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; }
    th { font-size: 11px; font-weight: 600; color: var(--text-secondary, #71717a); text-transform: uppercase; letter-spacing: 0.5px; background: var(--border-color, #fafafa); border-bottom: 1px solid var(--border-color, #f4f4f5); }
    td { font-size: 13px; color: var(--text-primary, #3f3f46); border-bottom: 1px solid var(--border-color, #f4f4f5); }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: var(--border-color, #fafafa); }

    .employee-cell { display: flex; align-items: center; gap: 10px; }

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

    .name { display: block; font-weight: 500; color: var(--text-primary, #18181b); }
    .position { display: block; font-size: 11px; color: var(--text-secondary, #71717a); }

    .rating {
      display: flex;
      gap: 2px;
    }

    .rating svg {
      width: 16px;
      height: 16px;
      color: #e4e4e7;
    }

    .rating svg.filled {
      color: #f59e0b;
      fill: #f59e0b;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge.draft { background: #fef3c7; color: #92400e; }
    .badge.submitted { background: #dbeafe; color: #1e40af; }
    .badge.acknowledged { background: #dcfce7; color: #166534; }

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
      color: var(--text-secondary, #71717a);
      transition: all 0.15s;
    }

    .btn-icon:hover { background: var(--border-color, #f4f4f5); color: var(--text-primary, #18181b); }
    .btn-icon.success:hover { background: #dcfce7; color: #16a34a; }
    .btn-icon svg { width: 15px; height: 15px; }

    /* Modal */
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
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .modal-lg { max-width: 600px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #f4f4f5);
      position: sticky;
      top: 0;
      background: var(--bg-secondary, #fff);
    }

    .modal-header h2 { font-size: 15px; font-weight: 600; margin: 0; color: var(--text-primary, #18181b); }

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
      color: var(--text-secondary, #71717a);
    }

    .btn-close:hover { background: var(--border-color, #f4f4f5); }
    .btn-close svg { width: 16px; height: 16px; }

    .modal-body { padding: 20px; }

    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field { margin-bottom: 14px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: 12px; font-weight: 500; color: var(--text-primary, #3f3f46); margin-bottom: 6px; }

    .field input, .field select, .field textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #e4e4e7);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: none;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #18181b);
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: #7c3aed;
    }

    .field input:disabled, .field select:disabled, .field textarea:disabled {
      background: var(--border-color, #f4f4f5);
      cursor: not-allowed;
    }

    .rating-input {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rating-input.disabled { opacity: 0.6; }

    .rating-input button {
      background: transparent;
      border: none;
      padding: 4px;
      cursor: pointer;
    }

    .rating-input button:disabled { cursor: not-allowed; }

    .rating-input svg {
      width: 28px;
      height: 28px;
      color: #e4e4e7;
      transition: all 0.15s;
    }

    .rating-input svg.filled {
      color: #f59e0b;
      fill: #f59e0b;
    }

    .rating-input button:not(:disabled):hover svg {
      transform: scale(1.1);
    }

    .rating-label {
      margin-left: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #18181b);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid var(--border-color, #f4f4f5);
      position: sticky;
      bottom: 0;
      background: var(--bg-secondary, #fff);
    }
  `]
})
export class PerformanceReviewComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private readonly API_URL = environment.apiUrl;
  
  employees = signal<Employee[]>([]);
  reviews = signal<PerformanceReview[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editing = signal(false);
  viewMode = signal(false);
  editId: number | null = null;
  
  form: any = {
    employeeId: null,
    reviewerId: null,
    reviewDate: new Date().toISOString().split('T')[0],
    reviewPeriod: '',
    rating: 3,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    comments: ''
  };

  ngOnInit(): void { 
    this.loadData(); 
  }

  loadData(): void {
    this.loading.set(true);
    
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => this.employees.set(data)
    });

    this.http.get<PerformanceReview[]>(`${this.API_URL}/performance-reviews`).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  draftCount(): number { return this.reviews().filter(r => r.status === 'DRAFT').length; }
  submittedCount(): number { return this.reviews().filter(r => r.status === 'SUBMITTED').length; }
  acknowledgedCount(): number { return this.reviews().filter(r => r.status === 'ACKNOWLEDGED').length; }
  
  averageRating(): number {
    const rated = this.reviews();
    if (rated.length === 0) return 0;
    return rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Rascunho', 'SUBMITTED': 'Submetida', 'ACKNOWLEDGED': 'Reconhecida'
    };
    return labels[status] || status;
  }

  setRating(rating: number): void {
    if (!this.viewMode()) {
      this.form.rating = rating;
    }
  }

  openModal(): void {
    this.form = {
      employeeId: null,
      reviewerId: null,
      reviewDate: new Date().toISOString().split('T')[0],
      reviewPeriod: this.getCurrentPeriod(),
      rating: 3,
      strengths: '',
      areasForImprovement: '',
      goals: '',
      comments: ''
    };
    this.editing.set(false);
    this.viewMode.set(false);
    this.editId = null;
    this.showModal.set(true);
  }

  closeModal(): void { 
    this.showModal.set(false); 
    this.viewMode.set(false);
  }

  viewReview(review: PerformanceReview): void {
    this.form = { ...review };
    this.viewMode.set(true);
    this.editing.set(false);
    this.showModal.set(true);
  }

  editReview(review: PerformanceReview): void {
    this.form = { ...review };
    this.editing.set(true);
    this.viewMode.set(false);
    this.editId = review.id;
    this.showModal.set(true);
  }

  submitReview(review: PerformanceReview): void {
    this.http.patch<PerformanceReview>(`${this.API_URL}/performance-reviews/${review.id}/submit`, {}).subscribe({
      next: () => {
        this.toast.success('Avaliação submetida com sucesso');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao submeter avaliação')
    });
  }

  acknowledgeReview(review: PerformanceReview): void {
    this.http.patch<PerformanceReview>(`${this.API_URL}/performance-reviews/${review.id}/acknowledge`, {}).subscribe({
      next: () => {
        this.toast.success('Avaliação reconhecida');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao reconhecer avaliação')
    });
  }

  save(): void {
    if (!this.form.employeeId || !this.form.reviewerId || !this.form.reviewDate) {
      this.toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving.set(true);

    const payload = {
      employeeId: this.form.employeeId,
      reviewerId: this.form.reviewerId,
      reviewDate: this.form.reviewDate,
      reviewPeriod: this.form.reviewPeriod,
      rating: this.form.rating,
      strengths: this.form.strengths,
      areasForImprovement: this.form.areasForImprovement,
      goals: this.form.goals,
      comments: this.form.comments
    };

    const request = this.editing() && this.editId
      ? this.http.put<PerformanceReview>(`${this.API_URL}/performance-reviews/${this.editId}`, payload)
      : this.http.post<PerformanceReview>(`${this.API_URL}/performance-reviews`, payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.editing() ? 'Avaliação atualizada' : 'Avaliação criada com sucesso');
        this.closeModal();
        this.loadData();
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erro ao salvar avaliação');
        this.saving.set(false);
      }
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${quarter} ${now.getFullYear()}`;
  }
}


