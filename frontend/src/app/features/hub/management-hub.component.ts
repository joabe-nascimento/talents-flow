import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-management-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hub-page">
      <header class="hub-header">
        <div class="hub-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <h1>Gestão de RH</h1>
          <p>Férias, avaliações e acompanhamento</p>
        </div>
      </header>

      <div class="hub-grid">
        <a routerLink="/dashboard/vacations" class="hub-card">
          <div class="card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Férias & Ausências</h3>
            <p>Solicitações e aprovações</p>
            @if (stats().pendingVacations > 0) {
              <span class="alert-badge">{{ stats().pendingVacations }} pendentes</span>
            }
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/performance" class="hub-card">
          <div class="card-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Avaliações</h3>
            <p>Desempenho e feedback</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/onboarding" class="hub-card">
          <div class="card-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Onboarding</h3>
            <p>Integração de novos</p>
            @if (stats().activeOnboardings > 0) {
              <span class="info-badge">{{ stats().activeOnboardings }} ativos</span>
            }
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/offboarding" class="hub-card">
          <div class="card-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Offboarding</h3>
            <p>Desligamentos</p>
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
    .hub-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .hub-icon svg { width: 32px; height: 32px; color: white; }
    .hub-header h1 { font-size: 24px; font-weight: 600; color: #18181b; margin: 0; }
    .hub-header p { font-size: 14px; color: #71717a; margin: 4px 0 0; }

    .hub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .hub-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; text-decoration: none; transition: all 0.2s; }
    .hub-card:hover { border-color: #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15); transform: translateY(-2px); }
    
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon svg { width: 24px; height: 24px; }
    .card-icon.blue { background: #dbeafe; color: #2563eb; }
    .card-icon.yellow { background: #fef3c7; color: #d97706; }
    .card-icon.green { background: #dcfce7; color: #16a34a; }
    .card-icon.red { background: #fee2e2; color: #dc2626; }
    
    .card-content { flex: 1; }
    .card-content h3 { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px; }
    .card-content p { font-size: 13px; color: #71717a; margin: 0; }
    .alert-badge { display: inline-block; margin-top: 8px; padding: 4px 10px; background: #fef3c7; color: #d97706; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .info-badge { display: inline-block; margin-top: 8px; padding: 4px 10px; background: #dcfce7; color: #16a34a; border-radius: 20px; font-size: 11px; font-weight: 500; }
    
    .card-arrow { width: 20px; height: 20px; color: #cbd5e1; transition: all 0.2s; }
    .hub-card:hover .card-arrow { color: #f59e0b; transform: translateX(4px); }

    @media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } }
  `]
})
export class ManagementHubComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  stats = signal({ pendingVacations: 0, activeOnboardings: 0 });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load stats if needed
  }
}


