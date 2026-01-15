import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalJobs: number;
  totalCandidates: number;
}

interface Candidate {
  id: number;
  status: string;
  appliedAt: string;
}

interface Employee {
  id: number;
  department: { id: number; name: string } | null;
  hireDate: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Relatórios</h1>
          <p>Métricas e indicadores</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <!-- KPIs -->
        <div class="kpis">
          <div class="kpi">
            <div class="kpi-value">{{ stats()?.totalEmployees || 0 }}</div>
            <div class="kpi-label">Funcionários</div>
            <div class="kpi-trend up">+12%</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">{{ stats()?.totalJobs || 0 }}</div>
            <div class="kpi-label">Vagas</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">{{ stats()?.totalCandidates || 0 }}</div>
            <div class="kpi-label">Candidatos</div>
            <div class="kpi-trend up">+23%</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">{{ successRate() }}%</div>
            <div class="kpi-label">Taxa de Sucesso</div>
          </div>
        </div>

        <div class="grid">
          <!-- Funnel -->
          <div class="card">
            <div class="card-header">
              <h2>Funil de Recrutamento</h2>
            </div>
            <div class="card-body">
              <div class="funnel">
                @for (stage of recruitmentFunnel(); track stage.status) {
                  <div class="funnel-item">
                    <div class="funnel-label">{{ stage.label }}</div>
                    <div class="funnel-bar-container">
                      <div class="funnel-bar" [style.width.%]="getFunnelWidth(stage.count)" [style.background]="stage.color"></div>
                      <span class="funnel-value">{{ stage.count }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- By Department -->
          <div class="card">
            <div class="card-header">
              <h2>Por Departamento</h2>
            </div>
            <div class="card-body">
              @if (employeesByDept().length === 0) {
                <div class="empty-chart">Sem dados</div>
              } @else {
                <div class="bar-chart">
                  @for (dept of employeesByDept(); track dept.name) {
                    <div class="bar-item">
                      <div class="bar-label">{{ dept.name }}</div>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="getBarWidth(dept.count)"></div>
                      </div>
                      <div class="bar-value">{{ dept.count }}</div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Conversion Rates -->
          <div class="card">
            <div class="card-header">
              <h2>Taxa de Conversão</h2>
            </div>
            <div class="card-body">
              <div class="metrics">
                <div class="metric">
                  <div class="metric-header">
                    <span>Novos → Triagem</span>
                    <span class="metric-value">{{ conversionRates().toScreening }}%</span>
                  </div>
                  <div class="metric-bar">
                    <div class="metric-fill yellow" [style.width.%]="conversionRates().toScreening"></div>
                  </div>
                </div>
                <div class="metric">
                  <div class="metric-header">
                    <span>Triagem → Entrevista</span>
                    <span class="metric-value">{{ conversionRates().toInterview }}%</span>
                  </div>
                  <div class="metric-bar">
                    <div class="metric-fill purple" [style.width.%]="conversionRates().toInterview"></div>
                  </div>
                </div>
                <div class="metric">
                  <div class="metric-header">
                    <span>Entrevista → Contratação</span>
                    <span class="metric-value">{{ conversionRates().toHired }}%</span>
                  </div>
                  <div class="metric-bar">
                    <div class="metric-fill green" [style.width.%]="conversionRates().toHired"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly -->
          <div class="card">
            <div class="card-header">
              <h2>Contratações por Mês</h2>
            </div>
            <div class="card-body">
              <div class="column-chart">
                @for (month of hiringsByMonth(); track month.month) {
                  <div class="column-item">
                    <div class="column-bar" [style.height.%]="getColumnHeight(month.count)">
                      <span class="column-value">{{ month.count }}</span>
                    </div>
                    <span class="column-label">{{ month.month }}</span>
                  </div>
                }
              </div>
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
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* KPIs */
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .kpi {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      padding: 16px;
      position: relative;
    }

    .kpi-value { font-size: 26px; font-weight: 700; color: #18181b; }
    .kpi-label { font-size: 12px; color: #71717a; margin-top: 2px; }

    .kpi-trend {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 11px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .kpi-trend.up { background: #dcfce7; color: #16a34a; }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .kpis { grid-template-columns: repeat(2, 1fr); }
      .grid { grid-template-columns: 1fr; }
    }

    .card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f4f4f5;
      overflow: hidden;
    }

    .card-header {
      padding: 14px 16px;
      border-bottom: 1px solid #f4f4f5;
    }

    .card-header h2 { font-size: 13px; font-weight: 600; color: #18181b; margin: 0; }

    .card-body { padding: 16px; }

    .empty-chart {
      padding: 40px;
      text-align: center;
      color: #a1a1aa;
      font-size: 13px;
    }

    /* Funnel */
    .funnel { display: flex; flex-direction: column; gap: 10px; }

    .funnel-item { display: flex; align-items: center; gap: 12px; }

    .funnel-label {
      width: 80px;
      font-size: 12px;
      color: #71717a;
      flex-shrink: 0;
    }

    .funnel-bar-container {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .funnel-bar {
      height: 24px;
      border-radius: 4px;
      min-width: 30px;
      transition: width 0.3s ease;
    }

    .funnel-value { font-size: 12px; font-weight: 600; color: #18181b; }

    /* Bar Chart */
    .bar-chart { display: flex; flex-direction: column; gap: 10px; }

    .bar-item { display: flex; align-items: center; gap: 10px; }

    .bar-label {
      width: 80px;
      font-size: 12px;
      color: #3f3f46;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-track {
      flex: 1;
      height: 20px;
      background: #f4f4f5;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-value { font-size: 12px; font-weight: 600; color: #18181b; width: 30px; }

    /* Metrics */
    .metrics { display: flex; flex-direction: column; gap: 14px; }

    .metric-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      color: #3f3f46;
    }

    .metric-value { font-weight: 600; color: #18181b; }

    .metric-bar {
      height: 6px;
      background: #f4f4f5;
      border-radius: 3px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .metric-fill.yellow { background: #f59e0b; }
    .metric-fill.purple { background: #7c3aed; }
    .metric-fill.green { background: #22c55e; }

    /* Column Chart */
    .column-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 140px;
      gap: 8px;
    }

    .column-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .column-bar {
      width: 100%;
      max-width: 40px;
      background: linear-gradient(180deg, #7c3aed, #a855f7);
      border-radius: 4px 4px 0 0;
      display: flex;
      justify-content: center;
      padding-top: 6px;
      min-height: 20px;
      transition: height 0.3s ease;
    }

    .column-value { font-size: 10px; font-weight: 600; color: white; }
    .column-label { font-size: 10px; color: #71717a; }
  `]
})
export class ReportsComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  candidates = signal<Candidate[]>([]);
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  
  recruitmentFunnel = signal<{status: string; label: string; count: number; color: string}[]>([]);
  employeesByDept = signal<{name: string; count: number}[]>([]);
  conversionRates = signal({toScreening: 0, toInterview: 0, toHired: 0});
  hiringsByMonth = signal<{month: string; count: number}[]>([]);
  successRate = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAllData(); }

  loadAllData(): void {
    this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`).subscribe({
      next: (data) => this.stats.set(data)
    });

    this.http.get<Candidate[]>(`${this.API_URL}/candidates`).subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.calculateFunnel(data);
        this.calculateConversion(data);
        this.calculateSuccess(data);
      }
    });

    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.calculateHirings(data);
      }
    });

    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data) => {
        this.departments.set(data);
        this.calculateByDept();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateFunnel(candidates: Candidate[]): void {
    const stages = [
      { status: 'NEW', label: 'Novos', color: '#3b82f6' },
      { status: 'SCREENING', label: 'Triagem', color: '#f59e0b' },
      { status: 'INTERVIEW', label: 'Entrevista', color: '#7c3aed' },
      { status: 'HIRED', label: 'Contratados', color: '#22c55e' },
      { status: 'REJECTED', label: 'Rejeitados', color: '#ef4444' }
    ];
    this.recruitmentFunnel.set(stages.map(s => ({ ...s, count: candidates.filter(c => c.status === s.status).length })));
  }

  calculateByDept(): void {
    const emps = this.employees();
    const depts = this.departments();
    const byDept = depts.map(d => ({ name: d.name, count: emps.filter(e => e.department?.id === d.id).length }))
      .filter(d => d.count > 0).sort((a, b) => b.count - a.count);
    this.employeesByDept.set(byDept);
  }

  calculateConversion(candidates: Candidate[]): void {
    const total = candidates.length || 1;
    const screening = candidates.filter(c => ['SCREENING', 'INTERVIEW', 'HIRED'].includes(c.status)).length;
    const interview = candidates.filter(c => ['INTERVIEW', 'HIRED'].includes(c.status)).length;
    const hired = candidates.filter(c => c.status === 'HIRED').length;
    this.conversionRates.set({
      toScreening: Math.round((screening / total) * 100),
      toInterview: Math.round((interview / Math.max(screening, 1)) * 100),
      toHired: Math.round((hired / Math.max(interview, 1)) * 100)
    });
  }

  calculateHirings(employees: Employee[]): void {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = employees.filter(e => {
        if (!e.hireDate) return false;
        const hd = new Date(e.hireDate);
        return hd.getMonth() === date.getMonth() && hd.getFullYear() === date.getFullYear();
      }).length;
      last6.push({ month: months[date.getMonth()] || 'N/A', count });
    }
    this.hiringsByMonth.set(last6);
  }

  calculateSuccess(candidates: Candidate[]): void {
    const hired = candidates.filter(c => c.status === 'HIRED').length;
    const total = candidates.length || 1;
    this.successRate.set(Math.round((hired / total) * 100));
  }

  getFunnelWidth(count: number): number {
    const max = Math.max(...this.recruitmentFunnel().map(s => s.count), 1);
    return Math.max((count / max) * 100, 10);
  }

  getBarWidth(count: number): number {
    const max = Math.max(...this.employeesByDept().map(d => d.count), 1);
    return Math.max((count / max) * 100, 10);
  }

  getColumnHeight(count: number): number {
    const max = Math.max(...this.hiringsByMonth().map(m => m.count), 1);
    return Math.max((count / max) * 100, 15);
  }
}
