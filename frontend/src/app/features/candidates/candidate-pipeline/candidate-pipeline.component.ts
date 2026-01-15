import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

interface PipelineColumn {
  status: string;
  title: string;
  color: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Pipeline</h1>
          <p>Arraste candidatos entre etapas</p>
        </div>
        <a routerLink="/dashboard/candidates" class="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          Lista
        </a>
      </header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="pipeline">
          @for (column of columns(); track column.status) {
            <div class="column" (dragover)="onDragOver($event)" (drop)="onDrop($event, column.status)">
              <div class="column-header">
                <div class="column-title">
                  <span class="dot" [style.background]="column.color"></span>
                  <span>{{ column.title }}</span>
                </div>
                <span class="count">{{ column.candidates.length }}</span>
              </div>
              <div class="column-body">
                @for (c of column.candidates; track c.id) {
                  <div class="card" draggable="true" (dragstart)="onDragStart($event, c)" (dragend)="onDragEnd()">
                    <div class="card-header">
                      <div class="avatar">{{ getInitials(c.name) }}</div>
                      <div class="info">
                        <span class="name">{{ c.name }}</span>
                        <span class="job">{{ c.jobPosition?.title || 'Sem vaga' }}</span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <span class="email">{{ c.email }}</span>
                      <span class="date">{{ formatDate(c.appliedAt) }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty">Nenhum candidato</div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 100%; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #f4f4f5;
      color: #3f3f46;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
    }

    .btn-secondary:hover { background: #e4e4e7; }
    .btn-secondary svg { width: 16px; height: 16px; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .pipeline {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 12px;
      min-height: calc(100vh - 160px);
    }

    .column {
      flex: 0 0 260px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 160px);
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border-bottom: 1px solid #f4f4f5;
    }

    .column-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #18181b;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .count {
      font-size: 11px;
      font-weight: 600;
      color: #71717a;
      background: #f4f4f5;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .column-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .column-body::-webkit-scrollbar { width: 4px; }
    .column-body::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }

    .card {
      background: #fafafa;
      border-radius: 8px;
      padding: 12px;
      cursor: grab;
      transition: all 0.15s;
      border: 1px solid transparent;
    }

    .card:hover {
      background: #f4f4f5;
      border-color: #e4e4e7;
    }

    .card:active { cursor: grabbing; opacity: 0.7; }

    .card-header {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

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
      flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0; }
    .name { display: block; font-size: 13px; font-weight: 500; color: #18181b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .job { display: block; font-size: 11px; color: #7c3aed; margin-top: 2px; }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .email { font-size: 11px; color: #71717a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .date { font-size: 10px; color: #a1a1aa; }

    .empty {
      padding: 20px;
      text-align: center;
      color: #a1a1aa;
      font-size: 12px;
    }

    .column.drag-over { background: #f5f3ff; }
  `]
})
export class CandidatePipelineComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  loading = signal(true);
  columns = signal<PipelineColumn[]>([]);
  private draggedCandidate: Candidate | null = null;
  
  private readonly statusConfig = [
    { status: 'NEW', title: 'Novos', color: '#3b82f6' },
    { status: 'SCREENING', title: 'Triagem', color: '#f59e0b' },
    { status: 'INTERVIEW', title: 'Entrevista', color: '#7c3aed' },
    { status: 'HIRED', title: 'Contratados', color: '#22c55e' },
    { status: 'REJECTED', title: 'Rejeitados', color: '#ef4444' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadCandidates(); }

  loadCandidates(): void {
    this.http.get<Candidate[]>(`${this.API_URL}/candidates`).subscribe({
      next: (candidates) => {
        const cols = this.statusConfig.map(config => ({
          ...config,
          candidates: candidates.filter(c => c.status === config.status)
        }));
        this.columns.set(cols);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  onDragStart(event: DragEvent, candidate: Candidate): void {
    this.draggedCandidate = candidate;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', candidate.id.toString());
    }
  }

  onDragEnd(): void {
    this.draggedCandidate = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.classList.add('drag-over');
    }
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.classList.remove('drag-over');
    }
    
    if (!this.draggedCandidate || this.draggedCandidate.status === newStatus) return;

    const candidate = this.draggedCandidate;
    const oldStatus = candidate.status;
    
    const cols = this.columns().map(col => {
      if (col.status === oldStatus) {
        return { ...col, candidates: col.candidates.filter(c => c.id !== candidate.id) };
      }
      if (col.status === newStatus) {
        return { ...col, candidates: [...col.candidates, { ...candidate, status: newStatus }] };
      }
      return col;
    });
    this.columns.set(cols);

    this.http.put(`${this.API_URL}/candidates/${candidate.id}`, {
      ...candidate,
      status: newStatus,
      jobPosition: candidate.jobPosition ? { id: candidate.jobPosition.id } : null
    }).subscribe({ error: () => this.loadCandidates() });
  }
}
