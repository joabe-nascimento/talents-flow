import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalJobs: number;
  totalCandidates: number;
  openJobs: number;
  newCandidates: number;
}

interface Candidate {
  id: number;
  status: string;
  appliedAt: string;
  jobPosition: { id: number; title: string } | null;
}

interface Employee {
  id: number;
  department: { id: number; name: string } | null;
  hireDate: string;
  status: string;
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
    <div class="page fade-in">
      <div class="page-header">
        <div>
          <h1>Relatórios e Analytics</h1>
          <p>Métricas e indicadores de RH</p>
        </div>
        <button class="btn btn-primary" (click)="exportReport()">
          📥 Exportar PDF
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      } @else {
        <!-- KPIs principais -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">👥</div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.totalEmployees || 0 }}</span>
              <span class="kpi-label">Total de Funcionários</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669)">💼</div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.openJobs || 0 }}</span>
              <span class="kpi-label">Vagas Abertas</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">📋</div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.totalCandidates || 0 }}</span>
              <span class="kpi-label">Total de Candidatos</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">🏢</div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.totalDepartments || 0 }}</span>
              <span class="kpi-label">Departamentos</span>
            </div>
          </div>
        </div>

        <!-- Gráficos e métricas -->
        <div class="charts-grid">
          <!-- Funil de Recrutamento -->
          <div class="chart-card">
            <h3>Funil de Recrutamento</h3>
            <div class="funnel">
              @for (stage of recruitmentFunnel(); track stage.status) {
                <div class="funnel-stage">
                  <div class="funnel-bar" 
                       [style.width.%]="getFunnelWidth(stage.count)"
                       [style.backgroundColor]="stage.color">
                    <span class="funnel-count">{{ stage.count }}</span>
                  </div>
                  <span class="funnel-label">{{ stage.label }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Funcionários por Departamento -->
          <div class="chart-card">
            <h3>Funcionários por Departamento</h3>
            <div class="bar-chart">
              @for (dept of employeesByDept(); track dept.name) {
                <div class="bar-item">
                  <div class="bar-label">{{ dept.name }}</div>
                  <div class="bar-container">
                    <div class="bar-fill" 
                         [style.width.%]="getBarWidth(dept.count, maxEmployeesInDept())"
                         [style.backgroundColor]="getRandomColor(dept.name)">
                    </div>
                    <span class="bar-value">{{ dept.count }}</span>
                  </div>
                </div>
              } @empty {
                <p class="no-data">Sem dados disponíveis</p>
              }
            </div>
          </div>

          <!-- Taxa de Conversão -->
          <div class="chart-card">
            <h3>Taxa de Conversão</h3>
            <div class="metrics-list">
              <div class="metric-item">
                <div class="metric-info">
                  <span class="metric-label">Candidatos → Triagem</span>
                  <span class="metric-value">{{ conversionRates().toScreening }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="metric-fill" [style.width.%]="conversionRates().toScreening" style="background: #f59e0b"></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-info">
                  <span class="metric-label">Triagem → Entrevista</span>
                  <span class="metric-value">{{ conversionRates().toInterview }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="metric-fill" [style.width.%]="conversionRates().toInterview" style="background: #8b5cf6"></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-info">
                  <span class="metric-label">Entrevista → Contratação</span>
                  <span class="metric-value">{{ conversionRates().toHired }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="metric-fill" [style.width.%]="conversionRates().toHired" style="background: #10b981"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contratações por Mês -->
          <div class="chart-card">
            <h3>Contratações nos Últimos 6 Meses</h3>
            <div class="line-chart">
              @for (month of hiringsByMonth(); track month.month) {
                <div class="chart-column">
                  <div class="column-bar" [style.height.%]="getColumnHeight(month.count)">
                    <span class="column-value">{{ month.count }}</span>
                  </div>
                  <span class="column-label">{{ month.month }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Tabela de Resumo -->
        <div class="summary-card">
          <h3>Resumo do Período</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-icon">📈</span>
              <div class="summary-content">
                <span class="summary-value">{{ avgTimeToHire() }} dias</span>
                <span class="summary-label">Tempo médio de contratação</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">✅</span>
              <div class="summary-content">
                <span class="summary-value">{{ totalHired() }}</span>
                <span class="summary-label">Contratados este mês</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">⏳</span>
              <div class="summary-content">
                <span class="summary-value">{{ pendingCandidates() }}</span>
                <span class="summary-label">Candidatos em processo</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">📊</span>
              <div class="summary-content">
                <span class="summary-value">{{ successRate() }}%</span>
                <span class="summary-label">Taxa de sucesso</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2rem; 
    }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    
    .btn { 
      padding: 0.625rem 1.25rem; 
      border-radius: 0.5rem; 
      cursor: pointer; 
      border: none; 
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    
    .loading-state { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
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
      margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .kpi-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .kpi-icon {
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .kpi-content {
      display: flex;
      flex-direction: column;
    }
    
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    .kpi-label {
      font-size: 0.875rem;
      color: #64748b;
    }
    
    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    @media (max-width: 1024px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    
    .chart-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .chart-card h3 {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #1e293b;
    }
    
    /* Funnel Chart */
    .funnel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .funnel-stage {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .funnel-bar {
      height: 36px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.75rem;
      min-width: 60px;
      transition: width 0.5s ease;
    }
    
    .funnel-count {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .funnel-label {
      color: #64748b;
      font-size: 0.875rem;
      white-space: nowrap;
    }
    
    /* Bar Chart */
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .bar-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .bar-label {
      width: 120px;
      font-size: 0.875rem;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .bar-container {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .bar-fill {
      height: 24px;
      border-radius: 0.25rem;
      transition: width 0.5s ease;
    }
    
    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    /* Metrics List */
    .metrics-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .metric-info {
      display: flex;
      justify-content: space-between;
    }
    
    .metric-label {
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .metric-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .metric-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .metric-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    /* Line Chart */
    .line-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      padding-top: 1rem;
    }
    
    .chart-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: 0.5rem;
    }
    
    .column-bar {
      width: 40px;
      background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 0.25rem 0.25rem 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 0.5rem;
      min-height: 20px;
      transition: height 0.5s ease;
    }
    
    .column-value {
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .column-label {
      font-size: 0.75rem;
      color: #64748b;
    }
    
    /* Summary Card */
    .summary-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #1e293b;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.75rem;
    }
    
    .summary-icon {
      font-size: 1.5rem;
    }
    
    .summary-content {
      display: flex;
      flex-direction: column;
    }
    
    .summary-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    .summary-label {
      font-size: 0.75rem;
      color: #64748b;
    }
    
    .no-data {
      color: #94a3b8;
      text-align: center;
      padding: 2rem;
    }
    
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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
  maxEmployeesInDept = signal(0);
  conversionRates = signal({toScreening: 0, toInterview: 0, toHired: 0});
  hiringsByMonth = signal<{month: string; count: number}[]>([]);
  
  avgTimeToHire = signal(0);
  totalHired = signal(0);
  pendingCandidates = signal(0);
  successRate = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    // Load stats
    this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`).subscribe({
      next: (data) => this.stats.set(data)
    });

    // Load candidates
    this.http.get<Candidate[]>(`${this.API_URL}/candidates`).subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.calculateRecruitmentFunnel(data);
        this.calculateConversionRates(data);
        this.calculateMetrics(data);
      }
    });

    // Load employees
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.calculateHiringsByMonth(data);
      }
    });

    // Load departments
    this.http.get<Department[]>(`${this.API_URL}/departments`).subscribe({
      next: (data) => {
        this.departments.set(data);
        this.calculateEmployeesByDept();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateRecruitmentFunnel(candidates: Candidate[]): void {
    const stages = [
      { status: 'NEW', label: 'Novos', color: '#3b82f6' },
      { status: 'SCREENING', label: 'Triagem', color: '#f59e0b' },
      { status: 'INTERVIEW', label: 'Entrevista', color: '#8b5cf6' },
      { status: 'HIRED', label: 'Contratados', color: '#10b981' },
      { status: 'REJECTED', label: 'Rejeitados', color: '#ef4444' }
    ];

    const funnel = stages.map(stage => ({
      ...stage,
      count: candidates.filter(c => c.status === stage.status).length
    }));

    this.recruitmentFunnel.set(funnel);
  }

  calculateEmployeesByDept(): void {
    const employees = this.employees();
    const departments = this.departments();
    
    const byDept = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(e => e.department?.id === dept.id).length
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

    this.employeesByDept.set(byDept);
    this.maxEmployeesInDept.set(Math.max(...byDept.map(d => d.count), 1));
  }

  calculateConversionRates(candidates: Candidate[]): void {
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

  calculateHiringsByMonth(employees: Employee[]): void {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const count = employees.filter(e => {
        if (!e.hireDate) return false;
        const hireDate = new Date(e.hireDate);
        return hireDate.getMonth() === date.getMonth() && hireDate.getFullYear() === date.getFullYear();
      }).length;
      last6Months.push({ month: monthName, count });
    }

    this.hiringsByMonth.set(last6Months);
  }

  calculateMetrics(candidates: Candidate[]): void {
    const hired = candidates.filter(c => c.status === 'HIRED');
    const pending = candidates.filter(c => ['NEW', 'SCREENING', 'INTERVIEW'].includes(c.status));
    const total = candidates.length || 1;

    this.totalHired.set(hired.length);
    this.pendingCandidates.set(pending.length);
    this.successRate.set(Math.round((hired.length / total) * 100));
    
    // Simulated average time to hire (would need actual dates in real app)
    this.avgTimeToHire.set(Math.floor(Math.random() * 20) + 10);
  }

  getFunnelWidth(count: number): number {
    const max = Math.max(...this.recruitmentFunnel().map(s => s.count), 1);
    return Math.max((count / max) * 100, 15);
  }

  getBarWidth(count: number, max: number): number {
    return Math.max((count / max) * 100, 10);
  }

  getColumnHeight(count: number): number {
    const max = Math.max(...this.hiringsByMonth().map(m => m.count), 1);
    return Math.max((count / max) * 100, 10);
  }

  getRandomColor(seed: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
    const index = seed.charCodeAt(0) % colors.length;
    return colors[index];
  }

  exportReport(): void {
    alert('Funcionalidade de exportação PDF em desenvolvimento!');
  }
}

