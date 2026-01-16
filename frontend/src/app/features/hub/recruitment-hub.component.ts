import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recruitment-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hub-page">
      <header class="hub-header">
        <div class="hub-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          </svg>
        </div>
        <div>
          <h1>Recrutamento</h1>
          <p>Vagas, candidatos e processos seletivos</p>
        </div>
      </header>

      <div class="stats-row">
        <div class="stat">
          <span class="value">{{ stats().jobs }}</span>
          <span class="label">Vagas Abertas</span>
        </div>
        <div class="stat">
          <span class="value">{{ stats().candidates }}</span>
          <span class="label">Candidatos</span>
        </div>
        <div class="stat">
          <span class="value">{{ stats().hired }}</span>
          <span class="label">Contratados</span>
        </div>
      </div>

      <div class="hub-grid">
        <a routerLink="/dashboard/jobs" class="hub-card">
          <div class="card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Vagas</h3>
            <p>Posições abertas e publicadas</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/candidates" class="hub-card">
          <div class="card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Candidatos</h3>
            <p>Lista de candidaturas</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/pipeline" class="hub-card featured">
          <div class="card-icon gradient">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Pipeline</h3>
            <p>Kanban de processos seletivos</p>
            <span class="badge">Recomendado</span>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .hub-page { width: 100%; }
    .hub-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .hub-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .hub-icon svg { width: 32px; height: 32px; color: white; }
    .hub-header h1 { font-size: 24px; font-weight: 600; color: #18181b; margin: 0; }
    .hub-header p { font-size: 14px; color: #71717a; margin: 4px 0 0; }

    .stats-row { display: flex; gap: 24px; margin-bottom: 32px; padding: 20px; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-radius: 16px; }
    .stat { text-align: center; flex: 1; }
    .stat .value { display: block; font-size: 28px; font-weight: 700; color: #7c3aed; }
    .stat .label { font-size: 13px; color: #64748b; }

    .hub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .hub-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; text-decoration: none; transition: all 0.2s; }
    .hub-card:hover { border-color: #7c3aed; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15); transform: translateY(-2px); }
    .hub-card.featured { grid-column: 1 / -1; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #c4b5fd; }
    
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon svg { width: 24px; height: 24px; }
    .card-icon.blue { background: #dbeafe; color: #2563eb; }
    .card-icon.purple { background: #f3e8ff; color: #7c3aed; }
    .card-icon.gradient { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; }
    
    .card-content { flex: 1; }
    .card-content h3 { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px; }
    .card-content p { font-size: 13px; color: #71717a; margin: 0; }
    .badge { display: inline-block; margin-top: 8px; padding: 4px 10px; background: #7c3aed; color: white; border-radius: 20px; font-size: 11px; font-weight: 500; }
    
    .card-arrow { width: 20px; height: 20px; color: #cbd5e1; transition: all 0.2s; }
    .hub-card:hover .card-arrow { color: #7c3aed; transform: translateX(4px); }

    @media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } }
  `]
})
export class RecruitmentHubComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  stats = signal({ jobs: 0, candidates: 0, hired: 0 });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.API_URL}/dashboard`).subscribe({
      next: (data) => this.stats.set({ 
        jobs: data.openPositions || 0, 
        candidates: data.totalCandidates || 0,
        hired: 0
      })
    });
  }
}


