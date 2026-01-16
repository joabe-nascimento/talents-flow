import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Document {
  id: number;
  employeeId: number;
  employeeName: string;
  name: string;
  type: string;
  typeLabel: string;
  fileName: string;
  fileSizeFormatted: string;
  expirationDate: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isVerified: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Gestão de Documentos" 
        [subtitle]="documents().length + ' documentos cadastrados'"
        backLink="/dashboard/people"
        backLabel="Pessoas">
        <button class="btn-primary" (click)="openUploadModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload
        </button>
      </app-page-header>

      <div class="alerts">
        @if (expiredDocs().length > 0) {
          <div class="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ expiredDocs().length }} documento(s) expirado(s)</span>
          </div>
        }
        @if (expiringDocs().length > 0) {
          <div class="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>{{ expiringDocs().length }} documento(s) expirando em breve</span>
          </div>
        }
      </div>

      <div class="filters">
        <input type="text" placeholder="Buscar documentos..." [(ngModel)]="searchTerm" (input)="filterDocuments()" class="search-input"/>
        <select [(ngModel)]="filterType" (change)="filterDocuments()" class="select-filter">
          <option value="">Todos os tipos</option>
          <option *ngFor="let t of documentTypes" [value]="t.value">{{ t.label }}</option>
        </select>
        <select [(ngModel)]="filterStatus" (change)="filterDocuments()" class="select-filter">
          <option value="">Todos os status</option>
          <option value="verified">Verificados</option>
          <option value="pending">Pendentes</option>
          <option value="expired">Expirados</option>
        </select>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="documents-grid">
          @for (doc of filteredDocuments(); track doc.id) {
            <div class="doc-card" [class.expired]="doc.isExpired" [class.expiring]="doc.isExpiringSoon">
              <div class="doc-icon" [class]="getIconClass(doc.type)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="doc-info">
                <h3>{{ doc.name }}</h3>
                <span class="doc-type">{{ doc.typeLabel }}</span>
                <span class="doc-employee">{{ doc.employeeName }}</span>
                <span class="doc-size">{{ doc.fileSizeFormatted }}</span>
              </div>
              <div class="doc-status">
                @if (doc.isExpired) {
                  <span class="badge expired">Expirado</span>
                } @else if (doc.isExpiringSoon) {
                  <span class="badge expiring">Expirando</span>
                } @else if (doc.isVerified) {
                  <span class="badge verified">Verificado</span>
                } @else {
                  <span class="badge pending">Pendente</span>
                }
              </div>
              <div class="doc-actions">
                <button class="btn-icon" title="Download" (click)="download(doc)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                @if (!doc.isVerified) {
                  <button class="btn-icon success" title="Verificar" (click)="verify(doc)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                }
                <button class="btn-icon danger" title="Excluir" (click)="delete(doc)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty">Nenhum documento encontrado</div>
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

    .alerts { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .alert { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
    .alert svg { width: 20px; height: 20px; }
    .alert-error { background: #fee2e2; color: #dc2626; }
    .alert-warning { background: #fef3c7; color: #d97706; }

    .filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-size: 14px; }
    .select-filter { padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-size: 14px; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .doc-card { background: white; border-radius: 12px; border: 1px solid #f4f4f5; padding: 16px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
    .doc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .doc-card.expired { border-color: #fecaca; background: #fef2f2; }
    .doc-card.expiring { border-color: #fed7aa; background: #fffbeb; }

    .doc-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-icon svg { width: 24px; height: 24px; }
    .doc-icon.rg, .doc-icon.cpf { background: #dbeafe; color: #2563eb; }
    .doc-icon.contrato_trabalho { background: #f3e8ff; color: #7c3aed; }
    .doc-icon.atestado_medico { background: #dcfce7; color: #16a34a; }
    .doc-icon { background: #f4f4f5; color: #71717a; }

    .doc-info { flex: 1; min-width: 0; }
    .doc-info h3 { font-size: 14px; font-weight: 600; color: #18181b; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-type { display: block; font-size: 12px; color: #7c3aed; margin-bottom: 4px; }
    .doc-employee { display: block; font-size: 12px; color: #71717a; }
    .doc-size { display: block; font-size: 11px; color: #a1a1aa; }

    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .badge.verified { background: #dcfce7; color: #16a34a; }
    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.expired { background: #fee2e2; color: #dc2626; }
    .badge.expiring { background: #fed7aa; color: #ea580c; }

    .doc-actions { display: flex; gap: 4px; }
    .btn-icon { width: 32px; height: 32px; background: transparent; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #71717a; }
    .btn-icon:hover { background: #f4f4f5; color: #18181b; }
    .btn-icon.success:hover { background: #dcfce7; color: #16a34a; }
    .btn-icon.danger:hover { background: #fee2e2; color: #dc2626; }
    .btn-icon svg { width: 16px; height: 16px; }

    .empty { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #a1a1aa; }
  `]
})
export class DocumentsComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  documents = signal<Document[]>([]);
  filteredDocuments = signal<Document[]>([]);
  loading = signal(true);
  
  searchTerm = '';
  filterType = '';
  filterStatus = '';
  
  documentTypes = [
    { value: 'RG', label: 'RG' },
    { value: 'CPF', label: 'CPF' },
    { value: 'CTPS', label: 'Carteira de Trabalho' },
    { value: 'CONTRATO_TRABALHO', label: 'Contrato de Trabalho' },
    { value: 'ATESTADO_MEDICO', label: 'Atestado Médico' },
    { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
    { value: 'CERTIFICADO_CURSO', label: 'Certificado de Curso' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.http.get<Document[]>(`${this.API_URL}/documents`).subscribe({
      next: (data) => { 
        this.documents.set(data); 
        this.filteredDocuments.set(data);
        this.loading.set(false); 
      },
      error: () => { this.documents.set([]); this.filteredDocuments.set([]); this.loading.set(false); }
    });
  }

  filterDocuments(): void {
    let filtered = this.documents();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.employeeName.toLowerCase().includes(term)
      );
    }
    
    if (this.filterType) {
      filtered = filtered.filter(d => d.type === this.filterType);
    }
    
    if (this.filterStatus) {
      switch (this.filterStatus) {
        case 'verified': filtered = filtered.filter(d => d.isVerified); break;
        case 'pending': filtered = filtered.filter(d => !d.isVerified); break;
        case 'expired': filtered = filtered.filter(d => d.isExpired); break;
      }
    }
    
    this.filteredDocuments.set(filtered);
  }

  expiredDocs(): Document[] {
    return this.documents().filter(d => d.isExpired);
  }

  expiringDocs(): Document[] {
    return this.documents().filter(d => d.isExpiringSoon && !d.isExpired);
  }

  getIconClass(type: string): string {
    return type.toLowerCase();
  }

  openUploadModal(): void {
    // TODO: Implement upload modal
    alert('Upload modal - implementar');
  }

  download(doc: Document): void {
    window.open(`${this.API_URL}/documents/${doc.id}/download`, '_blank');
  }

  verify(doc: Document): void {
    this.http.post(`${this.API_URL}/documents/${doc.id}/verify?verifiedById=1`, {}).subscribe({
      next: () => this.loadDocuments()
    });
  }

  delete(doc: Document): void {
    if (confirm(`Excluir documento "${doc.name}"?`)) {
      this.http.delete(`${this.API_URL}/documents/${doc.id}`).subscribe({
        next: () => this.loadDocuments()
      });
    }
  }
}

