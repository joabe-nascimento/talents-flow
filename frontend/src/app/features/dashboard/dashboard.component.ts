import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardData {
  totalEmployees: number;
  totalDepartments: number;
  openPositions: number;
  totalCandidates: number;
}

interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  userName: string;
  type: string;
  timeAgo: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <!-- Header -->
      <header class="header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema</p>
        </div>
        <div class="header-actions">
          <span class="date">{{ today }}</span>
        </div>
      </header>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else {
        <!-- Stats -->
        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ data()?.totalEmployees || 0 }}</span>
              <span class="stat-label">Funcionários</span>
            </div>
            <div class="stat-trend up">+12%</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ data()?.totalDepartments || 0 }}</span>
              <span class="stat-label">Departamentos</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ data()?.openPositions || 0 }}</span>
              <span class="stat-label">Vagas Abertas</span>
            </div>
            <div class="stat-trend up">+5</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ data()?.totalCandidates || 0 }}</span>
              <span class="stat-label">Candidatos</span>
            </div>
            <div class="stat-trend up">+23%</div>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h2>Ações Rápidas</h2>
            </div>
            <div class="actions">
              <a routerLink="/dashboard/employees" class="action">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </div>
                <span>Novo Funcionário</span>
              </a>
              <a routerLink="/dashboard/jobs" class="action">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    <line x1="12" y1="12" x2="12" y2="16"/>
                    <line x1="10" y1="14" x2="14" y2="14"/>
                  </svg>
                </div>
                <span>Nova Vaga</span>
              </a>
              <a routerLink="/dashboard/vacations" class="action">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <span>Solicitar Férias</span>
              </a>
              <a routerLink="/dashboard/reports" class="action">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <span>Relatórios</span>
              </a>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <div class="card-header">
              <h2>Atividade Recente</h2>
              <a routerLink="/dashboard/reports" class="btn-link">Ver tudo</a>
            </div>
            <div class="activity-list">
              @if (activities().length === 0) {
                <div class="activity-empty">Nenhuma atividade recente</div>
              } @else {
                @for (activity of activities(); track activity.id) {
                  <div class="activity-item">
                    <div class="activity-dot" [class]="getActivityDotClass(activity.type)"></div>
                    <div class="activity-content">
                      <span class="activity-text">{{ activity.description }}</span>
                      <span class="activity-time">{{ activity.timeAgo }}</span>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { width: 100%; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #18181b);
      margin: 0;
    }

    .header p {
      font-size: 13px;
      color: var(--text-secondary, #71717a);
      margin: 4px 0 0;
    }

    .date {
      font-size: 12px;
      color: var(--text-secondary, #71717a);
      background: var(--bg-secondary, #fff);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color, #e4e4e7);
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--border-color, #e4e4e7);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 1024px) { .stats { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg {
      width: 20px;
      height: 20px;
    }

    .stat-icon.blue { background: #eff6ff; color: #3b82f6; }
    .stat-icon.purple { background: #f5f3ff; color: #7c3aed; }
    .stat-icon.green { background: #f0fdf4; color: #22c55e; }
    .stat-icon.orange { background: #fff7ed; color: #f97316; }

    .stat-info { flex: 1; }

    .stat-value {
      display: block;
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary, #18181b);
      line-height: 1;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: var(--text-secondary, #71717a);
      margin-top: 4px;
    }

    .stat-trend {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .stat-trend.up {
      background: #dcfce7;
      color: #16a34a;
    }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }

    .card {
      background: var(--bg-secondary, #fff);
      border-radius: 12px;
      border: 1px solid var(--border-color, #f4f4f5);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #f4f4f5);
    }

    .card-header h2 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #18181b);
      margin: 0;
    }

    .btn-link {
      background: none;
      border: none;
      font-size: 12px;
      color: #7c3aed;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-link:hover { text-decoration: underline; }

    /* Actions */
    .actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 16px;
    }

    .action {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 8px;
      background: var(--border-color, #fafafa);
      text-decoration: none;
      color: var(--text-primary, #3f3f46);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .action:hover {
      background: var(--bg-primary, #f4f4f5);
    }

    .action-icon {
      width: 32px;
      height: 32px;
      background: var(--bg-secondary, #fff);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color, #e4e4e7);
    }

    .action-icon svg {
      width: 16px;
      height: 16px;
      color: var(--text-secondary, #71717a);
    }

    /* Activity */
    .activity-list {
      padding: 8px 16px 16px;
    }

    .activity-empty {
      padding: 20px;
      text-align: center;
      color: var(--text-muted, #a1a1aa);
      font-size: 13px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
    }

    .activity-item:not(:last-child) {
      border-bottom: 1px solid var(--border-color, #f4f4f5);
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .activity-dot.green { background: #22c55e; }
    .activity-dot.blue { background: #3b82f6; }
    .activity-dot.purple { background: #7c3aed; }
    .activity-dot.orange { background: #f97316; }
    .activity-dot.red { background: #ef4444; }

    .activity-content { flex: 1; }

    .activity-text {
      display: block;
      font-size: 13px;
      color: var(--text-primary, #3f3f46);
    }

    .activity-time {
      display: block;
      font-size: 11px;
      color: var(--text-muted, #a1a1aa);
      margin-top: 2px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  loading = signal(true);
  data = signal<DashboardData | null>(null);
  activities = signal<Activity[]>([]);
  today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.http.get<DashboardData>(`${this.API_URL}/dashboard`).subscribe({
      next: (data: DashboardData) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });

    this.http.get<Activity[]>(`${this.API_URL}/dashboard/activities`).subscribe({
      next: (activities) => this.activities.set(activities),
      error: () => {}
    });
  }

  getActivityDotClass(type: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'green',
      'UPDATE': 'blue',
      'DELETE': 'red',
      'STATUS_CHANGE': 'purple',
      'LOGIN': 'blue',
      'APPROVAL': 'green',
      'REJECTION': 'red'
    };
    return classes[type] || 'orange';
  }
}
