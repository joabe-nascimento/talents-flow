import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface OnboardingTask {
  id: number;
  title: string;
  description: string;
  categoryLabel: string;
  dueDate: string;
  isOverdue: boolean;
  isRequired: boolean;
  status: string;
  assignedToName: string;
  completedAt: string;
}

interface Onboarding {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentName: string;
  startDate: string;
  expectedEndDate: string;
  status: string;
  progressPercentage: number;
  mentorName: string;
  totalTasks: number;
  completedTasks: number;
  tasks: OnboardingTask[];
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Onboarding" 
        subtitle="Integração de novos funcionários"
        backLink="/dashboard/management"
        backLabel="Gestão RH">
        <div class="stats-mini">
          <div class="stat-mini">
            <span class="stat-value">{{ activeOnboardings().length }}</span>
            <span class="stat-label">Ativos</span>
          </div>
          <div class="stat-mini">
            <span class="stat-value">{{ averageProgress() }}%</span>
            <span class="stat-label">Progresso Médio</span>
          </div>
        </div>
      </app-page-header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="onboarding-grid">
          @for (o of onboardings(); track o.id) {
            <div class="onboarding-card">
              <div class="card-header">
                <div class="employee-info">
                  <div class="avatar">{{ getInitials(o.employeeName) }}</div>
                  <div>
                    <h3>{{ o.employeeName }}</h3>
                    <span class="position">{{ o.employeePosition }}</span>
                    <span class="department">{{ o.departmentName }}</span>
                  </div>
                </div>
                <span class="badge" [class]="o.status.toLowerCase()">
                  {{ getStatusLabel(o.status) }}
                </span>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span>Progresso</span>
                  <span>{{ o.progressPercentage }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="o.progressPercentage"></div>
                </div>
                <div class="progress-info">
                  <span>{{ o.completedTasks }}/{{ o.totalTasks }} tarefas</span>
                  @if (o.mentorName) {
                    <span>Mentor: {{ o.mentorName }}</span>
                  }
                </div>
              </div>

              <div class="tasks-section">
                <h4>Próximas Tarefas</h4>
                <div class="tasks-list">
                  @for (task of getPendingTasks(o); track task.id) {
                    <div class="task-item" [class.overdue]="task.isOverdue">
                      <div class="task-checkbox" (click)="completeTask(task)">
                        @if (task.status === 'COMPLETED') {
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        }
                      </div>
                      <div class="task-info">
                        <span class="task-title">{{ task.title }}</span>
                        <span class="task-category">{{ task.categoryLabel }}</span>
                      </div>
                      @if (task.isOverdue) {
                        <span class="overdue-badge">Atrasada</span>
                      }
                    </div>
                  } @empty {
                    <div class="no-tasks">Todas as tarefas foram concluídas!</div>
                  }
                </div>
              </div>

              <div class="card-footer">
                <span class="date">Início: {{ formatDate(o.startDate) }}</span>
                <button class="btn-link" (click)="viewDetails(o)">Ver detalhes</button>
              </div>
            </div>
          } @empty {
            <div class="empty">Nenhum onboarding em andamento</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }
    
    .stats-mini { display: flex; gap: 24px; }
    .stat-mini { text-align: center; }
    .stat-mini .stat-value { display: block; font-size: 24px; font-weight: 600; color: #7c3aed; }
    .stat-mini .stat-label { font-size: 12px; color: #71717a; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .onboarding-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .onboarding-card { background: white; border-radius: 12px; border: 1px solid #f4f4f5; overflow: hidden; }
    
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: 1px solid #f4f4f5; }
    .employee-info { display: flex; gap: 12px; }
    .avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; color: white; }
    .employee-info h3 { font-size: 16px; font-weight: 600; color: #18181b; margin: 0; }
    .position { display: block; font-size: 13px; color: #7c3aed; }
    .department { display: block; font-size: 12px; color: #71717a; }
    
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .badge.in_progress { background: #dbeafe; color: #2563eb; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.not_started { background: #f4f4f5; color: #71717a; }

    .progress-section { padding: 20px; border-bottom: 1px solid #f4f4f5; }
    .progress-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
    .progress-header span:last-child { font-weight: 600; color: #7c3aed; }
    .progress-bar { height: 8px; background: #f4f4f5; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #a855f7); border-radius: 4px; transition: width 0.3s; }
    .progress-info { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #71717a; }

    .tasks-section { padding: 20px; }
    .tasks-section h4 { font-size: 13px; font-weight: 600; color: #71717a; margin: 0 0 12px; }
    .tasks-list { display: flex; flex-direction: column; gap: 8px; }
    .task-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #fafafa; border-radius: 8px; }
    .task-item.overdue { background: #fef2f2; }
    .task-checkbox { width: 20px; height: 20px; border: 2px solid #d4d4d8; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .task-checkbox:hover { border-color: #7c3aed; }
    .task-checkbox svg { width: 14px; height: 14px; color: #7c3aed; }
    .task-info { flex: 1; }
    .task-title { display: block; font-size: 13px; font-weight: 500; color: #18181b; }
    .task-category { display: block; font-size: 11px; color: #71717a; }
    .overdue-badge { font-size: 10px; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; }
    .no-tasks { font-size: 13px; color: #16a34a; text-align: center; padding: 12px; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fafafa; }
    .date { font-size: 12px; color: #71717a; }
    .btn-link { background: none; border: none; color: #7c3aed; font-size: 13px; cursor: pointer; }
    .btn-link:hover { text-decoration: underline; }

    .empty { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #a1a1aa; }
  `]
})
export class OnboardingComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  onboardings = signal<Onboarding[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOnboardings();
  }

  loadOnboardings(): void {
    this.loading.set(true);
    this.http.get<Onboarding[]>(`${this.API_URL}/onboarding`).subscribe({
      next: (data) => { this.onboardings.set(data); this.loading.set(false); },
      error: () => { this.onboardings.set([]); this.loading.set(false); }
    });
  }

  activeOnboardings(): Onboarding[] {
    return this.onboardings().filter(o => o.status === 'IN_PROGRESS');
  }

  averageProgress(): number {
    const active = this.activeOnboardings();
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, o) => acc + o.progressPercentage, 0);
    return Math.round(sum / active.length);
  }

  getPendingTasks(o: Onboarding): OnboardingTask[] {
    return (o.tasks || []).filter(t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED').slice(0, 3);
  }

  completeTask(task: OnboardingTask): void {
    if (task.status === 'COMPLETED') return;
    this.http.post(`${this.API_URL}/onboarding/task/${task.id}/complete`, {}).subscribe({
      next: () => this.loadOnboardings()
    });
  }

  viewDetails(o: Onboarding): void {
    // TODO: Implement details modal
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NOT_STARTED': 'Não Iniciado',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }
}

