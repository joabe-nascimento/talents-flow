import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DashboardData {
  totalEmployees: number;
  totalDepartments: number;
  openPositions: number;
  totalCandidates: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard fade-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema de gestão de talentos</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      } @else {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">👥</div>
            <div class="stat-content">
              <span class="stat-value">{{ data()?.totalEmployees || 0 }}</span>
              <span class="stat-label">Funcionários</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-purple">🏢</div>
            <div class="stat-content">
              <span class="stat-value">{{ data()?.totalDepartments || 0 }}</span>
              <span class="stat-label">Departamentos</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-green">💼</div>
            <div class="stat-content">
              <span class="stat-value">{{ data()?.openPositions || 0 }}</span>
              <span class="stat-label">Vagas Abertas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-orange">📋</div>
            <div class="stat-content">
              <span class="stat-value">{{ data()?.totalCandidates || 0 }}</span>
              <span class="stat-label">Candidatos</span>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Ações Rápidas</h2>
          <div class="actions-grid">
            <a routerLink="/dashboard/employees" class="action-card">
              <span class="action-icon">👤</span>
              <span class="action-text">Novo Funcionário</span>
            </a>
            <a routerLink="/dashboard/jobs" class="action-card">
              <span class="action-icon">📝</span>
              <span class="action-text">Nova Vaga</span>
            </a>
            <a routerLink="/dashboard/candidates" class="action-card">
              <span class="action-icon">📨</span>
              <span class="action-text">Ver Candidatos</span>
            </a>
            <a routerLink="/dashboard/departments" class="action-card">
              <span class="action-icon">🏗️</span>
              <span class="action-text">Departamentos</span>
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.25rem;
        font-size: 1.75rem;
      }

      p {
        color: var(--gray-500);
        margin: 0;
      }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      p {
        margin-top: 1rem;
        color: #64748b;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon-blue {
      background: rgba(59, 130, 246, 0.1);
    }

    .stat-icon-purple {
      background: rgba(139, 92, 246, 0.1);
    }

    .stat-icon-green {
      background: rgba(34, 197, 94, 0.1);
    }

    .stat-icon-orange {
      background: rgba(249, 115, 22, 0.1);
    }

    .stat-content {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
      }

      .stat-label {
        color: #64748b;
        font-size: 0.875rem;
      }
    }

    .quick-actions {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h2 {
        margin: 0 0 1rem;
        font-size: 1.125rem;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      text-decoration: none;
      color: #334155;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        transform: translateY(-2px);
      }

      .action-icon {
        font-size: 1.75rem;
      }

      .action-text {
        font-weight: 500;
        font-size: 0.9375rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  data = signal<DashboardData | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.http.get<DashboardData>('http://localhost:8085/api/dashboard').subscribe({
      next: (data: DashboardData) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
