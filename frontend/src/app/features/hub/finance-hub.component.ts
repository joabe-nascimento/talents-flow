import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-finance-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hub-page">
      <header class="hub-header">
        <div class="hub-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div>
          <h1>Financeiro</h1>
          <p>Folha de pagamento e controle de ponto</p>
        </div>
      </header>

      <div class="hub-grid">
        <a routerLink="/dashboard/payroll" class="hub-card featured">
          <div class="card-icon gradient">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Folha de Pagamento</h3>
            <p>Holerites, cálculos de impostos e pagamentos</p>
            <div class="card-tags">
              <span class="tag">INSS</span>
              <span class="tag">IRRF</span>
              <span class="tag">FGTS</span>
            </div>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/time-records" class="hub-card">
          <div class="card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Controle de Ponto</h3>
            <p>Registros de entrada e saída</p>
          </div>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <a routerLink="/dashboard/reports" class="hub-card">
          <div class="card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <div class="card-content">
            <h3>Relatórios</h3>
            <p>Exportações e análises</p>
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
    .hub-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #16a34a, #22c55e); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .hub-icon svg { width: 32px; height: 32px; color: white; }
    .hub-header h1 { font-size: 24px; font-weight: 600; color: #18181b; margin: 0; }
    .hub-header p { font-size: 14px; color: #71717a; margin: 4px 0 0; }

    .hub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .hub-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; text-decoration: none; transition: all 0.2s; }
    .hub-card:hover { border-color: #16a34a; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15); transform: translateY(-2px); }
    .hub-card.featured { grid-column: 1 / -1; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #86efac; }
    
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon svg { width: 24px; height: 24px; }
    .card-icon.blue { background: #dbeafe; color: #2563eb; }
    .card-icon.purple { background: #f3e8ff; color: #7c3aed; }
    .card-icon.gradient { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; }
    
    .card-content { flex: 1; }
    .card-content h3 { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px; }
    .card-content p { font-size: 13px; color: #71717a; margin: 0; }
    .card-tags { display: flex; gap: 6px; margin-top: 10px; }
    .tag { padding: 4px 8px; background: rgba(22, 163, 74, 0.1); color: #16a34a; border-radius: 6px; font-size: 11px; font-weight: 500; }
    
    .card-arrow { width: 20px; height: 20px; color: #cbd5e1; transition: all 0.2s; }
    .hub-card:hover .card-arrow { color: #16a34a; transform: translateX(4px); }

    @media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } }
  `]
})
export class FinanceHubComponent implements OnInit {
  constructor(private http: HttpClient) {}
  ngOnInit(): void {}
}

