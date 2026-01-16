import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Offboarding {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentName: string;
  terminationType: string;
  terminationTypeLabel: string;
  terminationDate: string;
  lastWorkingDay: string;
  status: string;
  exitInterviewCompleted: boolean;
  equipmentReturned: boolean;
  accessRevoked: boolean;
  finalPaymentProcessed: boolean;
  documentsCollected: boolean;
  knowledgeTransferred: boolean;
  checklistProgress: number;
}

@Component({
  selector: 'app-offboarding',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Offboarding" 
        subtitle="Processos de desligamento"
        backLink="/dashboard/management"
        backLabel="Gestão RH">
        <button class="btn-primary" (click)="openNewOffboarding()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Desligamento
        </button>
      </app-page-header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="offboarding-list">
          @for (o of offboardings(); track o.id) {
            <div class="offboarding-card">
              <div class="card-header">
                <div class="employee-info">
                  <div class="avatar">{{ getInitials(o.employeeName) }}</div>
                  <div>
                    <h3>{{ o.employeeName }}</h3>
                    <span class="position">{{ o.employeePosition }}</span>
                    <span class="department">{{ o.departmentName }}</span>
                  </div>
                </div>
                <div class="header-right">
                  <span class="termination-type">{{ o.terminationTypeLabel }}</span>
                  <span class="badge" [class]="o.status.toLowerCase().replace('_', '-')">
                    {{ getStatusLabel(o.status) }}
                  </span>
                </div>
              </div>

              <div class="dates-section">
                <div class="date-item">
                  <span class="label">Data Desligamento</span>
                  <span class="value">{{ formatDate(o.terminationDate) }}</span>
                </div>
                <div class="date-item">
                  <span class="label">Último Dia</span>
                  <span class="value">{{ formatDate(o.lastWorkingDay) }}</span>
                </div>
              </div>

              <div class="checklist-section">
                <div class="checklist-header">
                  <span>Checklist</span>
                  <span class="progress">{{ o.checklistProgress }}%</span>
                </div>
                <div class="checklist-items">
                  <div class="checklist-item" [class.done]="o.exitInterviewCompleted" (click)="toggleChecklist(o, 'exitInterview')">
                    <div class="checkbox">
                      @if (o.exitInterviewCompleted) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Entrevista de Saída</span>
                  </div>
                  <div class="checklist-item" [class.done]="o.equipmentReturned" (click)="toggleChecklist(o, 'equipment')">
                    <div class="checkbox">
                      @if (o.equipmentReturned) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Equipamentos Devolvidos</span>
                  </div>
                  <div class="checklist-item" [class.done]="o.accessRevoked" (click)="toggleChecklist(o, 'access')">
                    <div class="checkbox">
                      @if (o.accessRevoked) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Acessos Revogados</span>
                  </div>
                  <div class="checklist-item" [class.done]="o.documentsCollected" (click)="toggleChecklist(o, 'documents')">
                    <div class="checkbox">
                      @if (o.documentsCollected) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Documentos Coletados</span>
                  </div>
                  <div class="checklist-item" [class.done]="o.finalPaymentProcessed" (click)="toggleChecklist(o, 'payment')">
                    <div class="checkbox">
                      @if (o.finalPaymentProcessed) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Pagamento Final</span>
                  </div>
                  <div class="checklist-item" [class.done]="o.knowledgeTransferred" (click)="toggleChecklist(o, 'knowledge')">
                    <div class="checkbox">
                      @if (o.knowledgeTransferred) { <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
                    </div>
                    <span>Conhecimento Transferido</span>
                  </div>
                </div>
              </div>

              @if (o.checklistProgress === 100 && o.status !== 'COMPLETED') {
                <div class="card-actions">
                  <button class="btn-success" (click)="complete(o)">Finalizar Desligamento</button>
                </div>
              }
            </div>
          } @empty {
            <div class="empty">Nenhum processo de desligamento em andamento</div>
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
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-primary svg { width: 18px; height: 18px; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .offboarding-list { display: flex; flex-direction: column; gap: 16px; }
    .offboarding-card { background: white; border-radius: 12px; border: 1px solid #f4f4f5; overflow: hidden; }
    
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: 1px solid #f4f4f5; }
    .employee-info { display: flex; gap: 12px; }
    .avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #dc2626, #f87171); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; color: white; }
    .employee-info h3 { font-size: 16px; font-weight: 600; color: #18181b; margin: 0; }
    .position { display: block; font-size: 13px; color: #71717a; }
    .department { display: block; font-size: 12px; color: #a1a1aa; }
    .header-right { text-align: right; }
    .termination-type { display: block; font-size: 12px; color: #dc2626; margin-bottom: 8px; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .badge.initiated { background: #dbeafe; color: #2563eb; }
    .badge.in-progress { background: #fef3c7; color: #d97706; }
    .badge.completed { background: #dcfce7; color: #16a34a; }

    .dates-section { display: flex; gap: 32px; padding: 16px 20px; background: #fafafa; }
    .date-item .label { display: block; font-size: 11px; color: #71717a; text-transform: uppercase; }
    .date-item .value { font-size: 14px; font-weight: 500; color: #18181b; }

    .checklist-section { padding: 20px; }
    .checklist-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #71717a; }
    .checklist-header .progress { color: #7c3aed; }
    .checklist-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .checklist-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f4f4f5; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .checklist-item:hover { background: #e4e4e7; }
    .checklist-item.done { background: #dcfce7; }
    .checkbox { width: 20px; height: 20px; border: 2px solid #d4d4d8; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .checklist-item.done .checkbox { border-color: #16a34a; background: #16a34a; }
    .checkbox svg { width: 14px; height: 14px; color: white; }
    .checklist-item span { font-size: 13px; color: #3f3f46; }

    .card-actions { padding: 16px 20px; border-top: 1px solid #f4f4f5; text-align: right; }
    .btn-success { padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .btn-success:hover { background: #15803d; }

    .empty { text-align: center; padding: 60px 20px; color: #a1a1aa; background: white; border-radius: 12px; border: 1px solid #f4f4f5; }

    @media (max-width: 640px) {
      .checklist-items { grid-template-columns: 1fr; }
    }
  `]
})
export class OffboardingComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  offboardings = signal<Offboarding[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOffboardings();
  }

  loadOffboardings(): void {
    this.loading.set(true);
    this.http.get<Offboarding[]>(`${this.API_URL}/offboarding`).subscribe({
      next: (data) => { this.offboardings.set(data); this.loading.set(false); },
      error: () => { this.offboardings.set([]); this.loading.set(false); }
    });
  }

  toggleChecklist(o: Offboarding, item: string): void {
    const params = new URLSearchParams();
    switch (item) {
      case 'equipment': params.set('equipmentReturned', (!o.equipmentReturned).toString()); break;
      case 'access': params.set('accessRevoked', (!o.accessRevoked).toString()); break;
      case 'payment': params.set('finalPaymentProcessed', (!o.finalPaymentProcessed).toString()); break;
      case 'documents': params.set('documentsCollected', (!o.documentsCollected).toString()); break;
      case 'knowledge': params.set('knowledgeTransferred', (!o.knowledgeTransferred).toString()); break;
    }
    
    this.http.patch(`${this.API_URL}/offboarding/${o.id}/checklist?${params.toString()}`, {}).subscribe({
      next: () => this.loadOffboardings()
    });
  }

  complete(o: Offboarding): void {
    this.http.post(`${this.API_URL}/offboarding/${o.id}/complete`, {}).subscribe({
      next: () => this.loadOffboardings()
    });
  }

  openNewOffboarding(): void {
    // TODO: Implement new offboarding modal
    alert('Novo desligamento - implementar');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'INITIATED': 'Iniciado',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }
}

