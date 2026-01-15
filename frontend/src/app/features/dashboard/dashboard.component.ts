import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardData } from '@core/models';

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
            <a routerLink="/employees" class="action-card">
              <span class="action-icon">👤</span>
              <span class="action-text">Novo Funcionário</span>
            </a>
            <a routerLink="/jobs" class="action-card">
              <span class="action-icon">📝</span>
              <span class="action-text">Nova Vaga</span>
            </a>
            <a routerLink="/candidates" class="action-card">
              <span class="action-icon">📨</span>
              <span class="action-text">Ver Candidatos</span>
            </a>
            <a routerLink="/departments" class="action-card">
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

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--gray-500);

      .spinner {
        width: 2rem;
        height: 2rem;
        margin-bottom: 1rem;
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
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;

      &-blue { background: #dbeafe; }
      &-purple { background: #e9d5ff; }
      &-green { background: #d1fae5; }
      &-orange { background: #fed7aa; }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .quick-actions {
      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--gray-700);
      box-shadow: var(--shadow);
      transition: all 0.2s;
      border: 2px solid transparent;

      &:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .action-icon {
        font-size: 2rem;
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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

