import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentName: string;
  referenceMonth: number;
  referenceYear: number;
  referencePeriod: string;
  baseSalary: number;
  grossSalary: number;
  inssValue: number;
  irrfValue: number;
  fgtsValue: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  paymentDate: string;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Folha de Pagamento" 
        subtitle="Gestão de holerites e pagamentos"
        backLink="/dashboard/finance"
        backLabel="Financeiro">
        <select [(ngModel)]="selectedMonth" (change)="loadPayrolls()" class="select-filter">
          <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
        </select>
        <select [(ngModel)]="selectedYear" (change)="loadPayrolls()" class="select-filter">
          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
        </select>
        <button class="btn-primary" (click)="generatePayroll()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Gerar Folha
        </button>
      </app-page-header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ payrolls().length }}</span>
            <span class="stat-label">Funcionários</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(totalGross()) }}</span>
            <span class="stat-label">Total Bruto</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 5l-7 7-7-7"/>
              <path d="M5 12l7 7 7-7"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(totalDeductions()) }}</span>
            <span class="stat-label">Total Descontos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(totalNet()) }}</span>
            <span class="stat-label">Total Líquido</span>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Departamento</th>
                <th>Salário Base</th>
                <th>Bruto</th>
                <th>Descontos</th>
                <th>Líquido</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of payrolls(); track p.id) {
                <tr>
                  <td>
                    <div class="employee-cell">
                      <div class="avatar">{{ getInitials(p.employeeName) }}</div>
                      <div>
                        <span class="name">{{ p.employeeName }}</span>
                        <span class="position">{{ p.employeePosition }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ p.departmentName || '-' }}</td>
                  <td>{{ formatCurrency(p.baseSalary) }}</td>
                  <td class="value-positive">{{ formatCurrency(p.grossSalary) }}</td>
                  <td class="value-negative">{{ formatCurrency(p.totalDeductions) }}</td>
                  <td class="value-highlight">{{ formatCurrency(p.netSalary) }}</td>
                  <td>
                    <span class="badge" [class]="p.status.toLowerCase()">
                      {{ getStatusLabel(p.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      @if (p.status === 'DRAFT') {
                        <button class="btn-icon" title="Calcular" (click)="calculate(p)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="4" y="2" width="16" height="20" rx="2"/>
                            <line x1="8" y1="6" x2="16" y2="6"/>
                            <line x1="8" y1="10" x2="16" y2="10"/>
                            <line x1="8" y1="14" x2="12" y2="14"/>
                          </svg>
                        </button>
                      }
                      @if (p.status === 'CALCULATED') {
                        <button class="btn-icon success" title="Aprovar" (click)="approve(p)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                      }
                      @if (p.status === 'APPROVED') {
                        <button class="btn-icon primary" title="Pagar" (click)="markAsPaid(p)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        </button>
                      }
                      <button class="btn-icon" title="Detalhes" (click)="viewDetails(p)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty">Nenhuma folha de pagamento para este período</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (showDetails()) {
      <div class="overlay" (click)="closeDetails()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalhes do Holerite</h2>
            <button class="btn-close" (click)="closeDetails()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedPayroll">
            <div class="payslip">
              <div class="payslip-header">
                <h3>{{ selectedPayroll.employeeName }}</h3>
                <p>{{ selectedPayroll.employeePosition }} - {{ selectedPayroll.departmentName }}</p>
                <p class="period">{{ selectedPayroll.referencePeriod }}</p>
              </div>
              
              <div class="payslip-section">
                <h4>Proventos</h4>
                <div class="payslip-row">
                  <span>Salário Base</span>
                  <span>{{ formatCurrency(selectedPayroll.baseSalary) }}</span>
                </div>
                <div class="payslip-row total">
                  <span>Total Bruto</span>
                  <span>{{ formatCurrency(selectedPayroll.grossSalary) }}</span>
                </div>
              </div>

              <div class="payslip-section">
                <h4>Descontos</h4>
                <div class="payslip-row">
                  <span>INSS</span>
                  <span class="negative">{{ formatCurrency(selectedPayroll.inssValue) }}</span>
                </div>
                <div class="payslip-row">
                  <span>IRRF</span>
                  <span class="negative">{{ formatCurrency(selectedPayroll.irrfValue) }}</span>
                </div>
                <div class="payslip-row total">
                  <span>Total Descontos</span>
                  <span class="negative">{{ formatCurrency(selectedPayroll.totalDeductions) }}</span>
                </div>
              </div>

              <div class="payslip-section">
                <h4>FGTS (não descontado)</h4>
                <div class="payslip-row">
                  <span>FGTS (8%)</span>
                  <span>{{ formatCurrency(selectedPayroll.fgtsValue) }}</span>
                </div>
              </div>

              <div class="payslip-total">
                <span>Salário Líquido</span>
                <span>{{ formatCurrency(selectedPayroll.netSalary) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    
    .select-filter { padding: 8px 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-size: 14px; }
    
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-primary svg { width: 18px; height: 18px; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #f4f4f5; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon svg { width: 24px; height: 24px; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-icon.red { background: #fee2e2; color: #dc2626; }
    .stat-icon.purple { background: #f3e8ff; color: #7c3aed; }
    .stat-value { font-size: 20px; font-weight: 600; color: #18181b; display: block; }
    .stat-label { font-size: 12px; color: #71717a; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card { background: white; border-radius: 12px; border: 1px solid #f4f4f5; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; }
    th { font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; background: #fafafa; border-bottom: 1px solid #f4f4f5; }
    td { font-size: 13px; color: #3f3f46; border-bottom: 1px solid #f4f4f5; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #fafafa; }

    .employee-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; }
    .name { display: block; font-weight: 500; color: #18181b; }
    .position { display: block; font-size: 12px; color: #71717a; }

    .value-positive { color: #16a34a; font-weight: 500; }
    .value-negative { color: #dc2626; font-weight: 500; }
    .value-highlight { color: #7c3aed; font-weight: 600; }

    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .badge.draft { background: #f3f4f6; color: #6b7280; }
    .badge.calculated { background: #dbeafe; color: #2563eb; }
    .badge.approved { background: #fef3c7; color: #d97706; }
    .badge.paid { background: #dcfce7; color: #16a34a; }

    .actions { display: flex; gap: 4px; }
    .btn-icon { width: 28px; height: 28px; background: transparent; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #71717a; }
    .btn-icon:hover { background: #f4f4f5; color: #18181b; }
    .btn-icon.success:hover { background: #dcfce7; color: #16a34a; }
    .btn-icon.primary:hover { background: #f3e8ff; color: #7c3aed; }
    .btn-icon svg { width: 15px; height: 15px; }

    .empty { text-align: center; color: #a1a1aa; padding: 40px !important; }

    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow: auto; }
    .modal-lg { max-width: 600px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f4f4f5; }
    .modal-header h2 { font-size: 16px; font-weight: 600; margin: 0; }
    .btn-close { width: 28px; height: 28px; background: transparent; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #71717a; }
    .btn-close:hover { background: #f4f4f5; }
    .btn-close svg { width: 16px; height: 16px; }
    .modal-body { padding: 20px; }

    .payslip { }
    .payslip-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f4f4f5; }
    .payslip-header h3 { font-size: 18px; margin: 0; color: #18181b; }
    .payslip-header p { margin: 4px 0; color: #71717a; font-size: 14px; }
    .payslip-header .period { color: #7c3aed; font-weight: 500; }
    .payslip-section { margin-bottom: 20px; }
    .payslip-section h4 { font-size: 13px; font-weight: 600; color: #71717a; margin: 0 0 12px; text-transform: uppercase; }
    .payslip-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f4f4f5; }
    .payslip-row.total { border-bottom: none; font-weight: 600; margin-top: 8px; padding-top: 12px; border-top: 1px solid #e4e4e7; }
    .payslip-row .negative { color: #dc2626; }
    .payslip-total { display: flex; justify-content: space-between; padding: 16px; background: #f3e8ff; border-radius: 8px; margin-top: 20px; font-size: 16px; font-weight: 600; color: #7c3aed; }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .header-actions { flex-wrap: wrap; }
    }
  `]
})
export class PayrollComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  payrolls = signal<Payroll[]>([]);
  loading = signal(true);
  showDetails = signal(false);
  selectedPayroll: Payroll | null = null;
  
  months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  years = [2024, 2025, 2026];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPayrolls();
  }

  loadPayrolls(): void {
    this.loading.set(true);
    this.http.get<Payroll[]>(`${this.API_URL}/payroll/period/${this.selectedYear}/${this.selectedMonth}`).subscribe({
      next: (data) => { this.payrolls.set(data); this.loading.set(false); },
      error: () => { this.payrolls.set([]); this.loading.set(false); }
    });
  }

  generatePayroll(): void {
    this.http.post<Payroll[]>(`${this.API_URL}/payroll/generate/${this.selectedYear}/${this.selectedMonth}`, {}).subscribe({
      next: () => this.loadPayrolls()
    });
  }

  calculate(p: Payroll): void {
    this.http.post<Payroll>(`${this.API_URL}/payroll/${p.id}/calculate`, {}).subscribe({
      next: () => this.loadPayrolls()
    });
  }

  approve(p: Payroll): void {
    this.http.post<Payroll>(`${this.API_URL}/payroll/${p.id}/approve`, {}).subscribe({
      next: () => this.loadPayrolls()
    });
  }

  markAsPaid(p: Payroll): void {
    this.http.post<Payroll>(`${this.API_URL}/payroll/${p.id}/pay`, {}).subscribe({
      next: () => this.loadPayrolls()
    });
  }

  viewDetails(p: Payroll): void {
    this.selectedPayroll = p;
    this.showDetails.set(true);
  }

  closeDetails(): void {
    this.showDetails.set(false);
    this.selectedPayroll = null;
  }

  totalGross(): number {
    return this.payrolls().reduce((sum, p) => sum + (p.grossSalary || 0), 0);
  }

  totalDeductions(): number {
    return this.payrolls().reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
  }

  totalNet(): number {
    return this.payrolls().reduce((sum, p) => sum + (p.netSalary || 0), 0);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Rascunho',
      'CALCULATED': 'Calculado',
      'APPROVED': 'Aprovado',
      'PAID': 'Pago'
    };
    return labels[status] || status;
  }
}

