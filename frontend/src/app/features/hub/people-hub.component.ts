import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-people-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hub-page">
      <header class="hub-header">
        <div class="hub-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="7" r="3"/>
            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
            <circle cx="17" cy="7" r="3"/>
            <path d="M21 21v-2a4 4 0 00-3-3.87"/>
          </svg>
        </div>
        <div>
          <h1>Gestão de Pessoas</h1>
          <p>Funcionários, departamentos e estrutura organizacional</p>
        </div>
      </header>

      <div class="stats-row">
        <div class="stat">
          <span class="value">{{ stats().employees }}</span>
          <span class="label">Funcionários</span>
        </div>
        <div class="stat">
          <span class="value">{{ stats().departments }}</span>
          <span class="label">Departamentos</span>
        </div>
        <div class="stat">
          <span class="value">{{ stats().active }}</span>
          <span class="label">Ativos</span>
        </div>
      </div>

      <div class="hub-grid">
        <a routerLink="/dashboard/employees" class="hub-card">
          <div class="card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="7" r="3"/>
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <circle cx="17" cy="7" r="3"/>
              <path d="M21 21v-2a4 4 0 00-3-3.87"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Funcionários</h3>
            <p>Cadastro e gestão de colaboradores</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/departments" class="hub-card">
          <div class="card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Departamentos</h3>
            <p>Áreas e setores da empresa</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/org-chart" class="hub-card">
          <div class="card-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="9" y="2" width="6" height="4" rx="1"/>
              <rect x="2" y="18" width="6" height="4" rx="1"/>
              <rect x="16" y="18" width="6" height="4" rx="1"/>
              <path d="M12 6v6M5 18v-4h14v4"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Organograma</h3>
            <p>Estrutura hierárquica</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/documents" class="hub-card">
          <div class="card-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Documentos</h3>
            <p>Arquivos e certificados</p>
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
    .hub-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .hub-icon svg { width: 32px; height: 32px; color: white; }
    .hub-header h1 { font-size: 24px; font-weight: 600; color: #18181b; margin: 0; }
    .hub-header p { font-size: 14px; color: #71717a; margin: 4px 0 0; }

    .stats-row { display: flex; gap: 24px; margin-bottom: 32px; padding: 20px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; }
    .stat { text-align: center; flex: 1; }
    .stat .value { display: block; font-size: 28px; font-weight: 700; color: #3b82f6; }
    .stat .label { font-size: 13px; color: #64748b; }

    .hub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .hub-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; text-decoration: none; transition: all 0.2s; }
    .hub-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); transform: translateY(-2px); }
    
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon svg { width: 24px; height: 24px; }
    .card-icon.blue { background: #dbeafe; color: #2563eb; }
    .card-icon.purple { background: #f3e8ff; color: #7c3aed; }
    .card-icon.green { background: #dcfce7; color: #16a34a; }
    .card-icon.orange { background: #ffedd5; color: #ea580c; }
    
    .card-content { flex: 1; }
    .card-content h3 { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px; }
    .card-content p { font-size: 13px; color: #71717a; margin: 0; }
    
    .card-arrow { width: 20px; height: 20px; color: #cbd5e1; transition: all 0.2s; }
    .hub-card:hover .card-arrow { color: #3b82f6; transform: translateX(4px); }

    @media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } }
  `]
})
export class PeopleHubComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  stats = signal({ employees: 0, departments: 0, active: 0 });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.API_URL}/dashboard`).subscribe({
      next: (data) => this.stats.set({ 
        employees: data.totalEmployees || 0, 
        departments: data.totalDepartments || 0,
        active: data.totalEmployees || 0 
      })
    });
  }
}

