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
  bgColor: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Pipeline de Recrutamento</h1>
          <p>Arraste os candidatos entre as etapas do processo seletivo</p>
        </div>
        <div class="header-actions">
          <a routerLink="/candidates" class="btn btn-secondary">📋 Lista</a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando pipeline...</p>
        </div>
      } @else {
        <div class="pipeline-container">
          @for (column of columns(); track column.status) {
            <div 
              class="pipeline-column"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event, column.status)"
            >
              <div class="column-header" [style.borderColor]="column.color">
                <div class="column-title">
                  <span class="column-dot" [style.backgroundColor]="column.color"></span>
                  {{ column.title }}
                </div>
                <span class="column-count" [style.backgroundColor]="column.bgColor" [style.color]="column.color">
                  {{ column.candidates.length }}
                </span>
              </div>
              
              <div class="column-content">
                @for (candidate of column.candidates; track candidate.id) {
                  <div 
                    class="candidate-card"
                    draggable="true"
                    (dragstart)="onDragStart($event, candidate)"
                    (dragend)="onDragEnd()"
                  >
                    <div class="candidate-avatar">
                      {{ getInitials(candidate.name) }}
                    </div>
                    <div class="candidate-info">
                      <h4>{{ candidate.name }}</h4>
                      <p class="candidate-job">{{ candidate.jobPosition?.title || 'Sem vaga' }}</p>
                      <p class="candidate-email">{{ candidate.email }}</p>
                    </div>
                    <div class="candidate-date">
                      {{ formatDate(candidate.appliedAt) }}
                    </div>
                  </div>
                } @empty {
                  <div class="empty-column">
                    <span>Nenhum candidato</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 100%; padding: 1.5rem; }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem; 
    }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    
    .header-actions { display: flex; gap: 0.75rem; }
    
    .btn { 
      padding: 0.5rem 1rem; 
      border-radius: 0.5rem; 
      cursor: pointer; 
      border: none; 
      font-size: 0.875rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
    
    .loading-state { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      padding: 4rem; 
      color: #64748b;
    }
    .spinner { 
      width: 40px; 
      height: 40px; 
      border: 3px solid #e2e8f0; 
      border-top-color: #3b82f6; 
      border-radius: 50%; 
      animation: spin 0.8s linear infinite; 
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .pipeline-container {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1rem;
      min-height: calc(100vh - 200px);
    }
    
    .pipeline-column {
      flex: 0 0 280px;
      background: #f8fafc;
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 200px);
    }
    
    .column-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 3px solid;
      border-radius: 0.75rem 0.75rem 0 0;
      background: white;
    }
    
    .column-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .column-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .column-count {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .column-content {
      flex: 1;
      padding: 0.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .candidate-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: grab;
      transition: all 0.2s;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }
    
    .candidate-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .candidate-card:active {
      cursor: grabbing;
      opacity: 0.8;
    }
    
    .candidate-card.dragging {
      opacity: 0.5;
      transform: rotate(3deg);
    }
    
    .candidate-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    
    .candidate-info {
      flex: 1;
      min-width: 0;
    }
    
    .candidate-info h4 {
      margin: 0;
      font-size: 0.875rem;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .candidate-job {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #3b82f6;
      font-weight: 500;
    }
    
    .candidate-email {
      margin: 0.25rem 0 0;
      font-size: 0.7rem;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .candidate-date {
      font-size: 0.65rem;
      color: #94a3b8;
      white-space: nowrap;
    }
    
    .empty-column {
      padding: 2rem 1rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }
    
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    /* Drag over styling */
    .pipeline-column.drag-over {
      background: #e0f2fe;
    }
  `]
})
export class CandidatePipelineComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  loading = signal(true);
  columns = signal<PipelineColumn[]>([]);
  
  private draggedCandidate: Candidate | null = null;
  
  private readonly statusConfig = [
    { status: 'NEW', title: 'Novos', color: '#3b82f6', bgColor: '#dbeafe' },
    { status: 'SCREENING', title: 'Triagem', color: '#f59e0b', bgColor: '#fef3c7' },
    { status: 'INTERVIEW', title: 'Entrevista', color: '#8b5cf6', bgColor: '#ede9fe' },
    { status: 'HIRED', title: 'Contratados', color: '#10b981', bgColor: '#d1fae5' },
    { status: 'REJECTED', title: 'Rejeitados', color: '#ef4444', bgColor: '#fee2e2' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

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
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  onDragStart(event: DragEvent, candidate: Candidate): void {
    this.draggedCandidate = candidate;
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragging');
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', candidate.id.toString());
    }
  }

  onDragEnd(): void {
    this.draggedCandidate = null;
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
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
    
    if (!this.draggedCandidate || this.draggedCandidate.status === newStatus) {
      return;
    }

    const candidate = this.draggedCandidate;
    const oldStatus = candidate.status;
    
    // Optimistic update
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

    // API call
    this.http.put(`${this.API_URL}/candidates/${candidate.id}`, {
      ...candidate,
      status: newStatus,
      jobPosition: candidate.jobPosition ? { id: candidate.jobPosition.id } : null
    }).subscribe({
      error: () => {
        // Rollback on error
        this.loadCandidates();
      }
    });
  }
}

