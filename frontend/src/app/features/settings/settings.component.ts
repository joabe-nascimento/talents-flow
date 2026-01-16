import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface CompanySettings {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  logo?: string;
}

interface WorkSchedule {
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  workDays: string[];
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="settings-page">
      <app-page-header 
        title="Configurações" 
        subtitle="Gerencie as configurações do sistema">
      </app-page-header>

      <div class="settings-layout">
        <!-- Sidebar de Navegação -->
        <aside class="settings-sidebar">
          <nav class="settings-nav">
            <div class="nav-section">
              <span class="nav-section-title">Geral</span>
              <button [class.active]="activeSection() === 'company'" (click)="activeSection.set('company')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Empresa
              </button>
              <button [class.active]="activeSection() === 'branding'" (click)="activeSection.set('branding')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Marca e Visual
              </button>
            </div>

            <div class="nav-section">
              <span class="nav-section-title">RH</span>
              <button [class.active]="activeSection() === 'schedule'" (click)="activeSection.set('schedule')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Horários de Trabalho
              </button>
              <button [class.active]="activeSection() === 'vacation'" (click)="activeSection.set('vacation')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Férias e Folgas
              </button>
              <button [class.active]="activeSection() === 'payroll'" (click)="activeSection.set('payroll')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Folha de Pagamento
              </button>
            </div>

            <div class="nav-section">
              <span class="nav-section-title">Sistema</span>
              <button [class.active]="activeSection() === 'security'" (click)="activeSection.set('security')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Segurança
              </button>
              <button [class.active]="activeSection() === 'email'" (click)="activeSection.set('email')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Configurações de Email
              </button>
              <button [class.active]="activeSection() === 'integrations'" (click)="activeSection.set('integrations')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="9" height="9" rx="2"/><rect x="13" y="2" width="9" height="9" rx="2"/><rect x="2" y="13" width="9" height="9" rx="2"/><rect x="13" y="13" width="9" height="9" rx="2"/></svg>
                Integrações
              </button>
              <button [class.active]="activeSection() === 'backup'" (click)="activeSection.set('backup')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                Backup e Dados
              </button>
            </div>

            <div class="nav-section">
              <span class="nav-section-title">Acessos</span>
              <button [class.active]="activeSection() === 'roles'" (click)="activeSection.set('roles')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Perfis e Permissões
              </button>
              <button [class.active]="activeSection() === 'audit'" (click)="activeSection.set('audit')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Logs de Auditoria
              </button>
            </div>
          </nav>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="settings-content">
          <!-- Seção: Empresa -->
          @if (activeSection() === 'company') {
            <div class="content-section">
              <div class="section-header">
                <h2>Dados da Empresa</h2>
                <p>Informações básicas da sua organização</p>
              </div>

              <form class="settings-form" (ngSubmit)="saveCompanySettings()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Nome da Empresa *</label>
                    <input type="text" [(ngModel)]="companySettings.name" name="name" required>
                  </div>
                  <div class="form-group">
                    <label>CNPJ</label>
                    <input type="text" [(ngModel)]="companySettings.cnpj" name="cnpj" placeholder="00.000.000/0000-00">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="companySettings.email" name="email">
                  </div>
                  <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" [(ngModel)]="companySettings.phone" name="phone" placeholder="(00) 0000-0000">
                  </div>
                </div>

                <div class="form-group">
                  <label>Website</label>
                  <input type="url" [(ngModel)]="companySettings.website" name="website" placeholder="https://www.empresa.com.br">
                </div>

                <div class="form-divider">
                  <span>Endereço</span>
                </div>

                <div class="form-group">
                  <label>Endereço</label>
                  <input type="text" [(ngModel)]="companySettings.address" name="address" placeholder="Rua, número, complemento">
                </div>

                <div class="form-row three-cols">
                  <div class="form-group">
                    <label>Cidade</label>
                    <input type="text" [(ngModel)]="companySettings.city" name="city">
                  </div>
                  <div class="form-group">
                    <label>Estado</label>
                    <select [(ngModel)]="companySettings.state" name="state">
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>CEP</label>
                    <input type="text" [(ngModel)]="companySettings.zipCode" name="zipCode" placeholder="00000-000">
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Seção: Marca e Visual -->
          @if (activeSection() === 'branding') {
            <div class="content-section">
              <div class="section-header">
                <h2>Marca e Visual</h2>
                <p>Personalize a aparência do sistema</p>
              </div>

              <div class="branding-section">
                <div class="logo-upload">
                  <div class="current-logo">
                    <img src="https://api.dicebear.com/8.x/initials/svg?seed=TF&backgroundColor=3b82f6" alt="Logo">
                  </div>
                  <div class="logo-actions">
                    <h4>Logo da Empresa</h4>
                    <p>Recomendado: PNG ou SVG, mínimo 200x200px</p>
                    <div class="btn-group">
                      <button class="btn-secondary" (click)="uploadLogo()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Logo
                      </button>
                      <button class="btn-text">Remover</button>
                    </div>
                  </div>
                </div>

                <div class="color-settings">
                  <h4>Cores do Sistema</h4>
                  <div class="color-grid">
                    <div class="color-item">
                      <label>Cor Primária</label>
                      <div class="color-picker">
                        <input type="color" [(ngModel)]="brandingSettings.primaryColor" (change)="previewColors()">
                        <span>{{ brandingSettings.primaryColor }}</span>
                      </div>
                    </div>
                    <div class="color-item">
                      <label>Cor Secundária</label>
                      <div class="color-picker">
                        <input type="color" [(ngModel)]="brandingSettings.secondaryColor" (change)="previewColors()">
                        <span>{{ brandingSettings.secondaryColor }}</span>
                      </div>
                    </div>
                    <div class="color-item">
                      <label>Cor de Destaque</label>
                      <div class="color-picker">
                        <input type="color" [(ngModel)]="brandingSettings.accentColor" (change)="previewColors()">
                        <span>{{ brandingSettings.accentColor }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button class="btn-secondary" (click)="resetBranding()">Restaurar Padrão</button>
                  <button class="btn-primary" (click)="saveBranding()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Seção: Horários de Trabalho -->
          @if (activeSection() === 'schedule') {
            <div class="content-section">
              <div class="section-header">
                <h2>Horários de Trabalho</h2>
                <p>Configure o expediente padrão da empresa</p>
              </div>

              <form class="settings-form" (ngSubmit)="saveSchedule()">
                <div class="schedule-card">
                  <h4>Expediente</h4>
                  <div class="time-grid">
                    <div class="form-group">
                      <label>Início do Expediente</label>
                      <input type="time" [(ngModel)]="workSchedule.startTime" name="startTime">
                    </div>
                    <div class="form-group">
                      <label>Fim do Expediente</label>
                      <input type="time" [(ngModel)]="workSchedule.endTime" name="endTime">
                    </div>
                  </div>
                </div>

                <div class="schedule-card">
                  <h4>Intervalo para Almoço</h4>
                  <div class="time-grid">
                    <div class="form-group">
                      <label>Início do Almoço</label>
                      <input type="time" [(ngModel)]="workSchedule.lunchStart" name="lunchStart">
                    </div>
                    <div class="form-group">
                      <label>Fim do Almoço</label>
                      <input type="time" [(ngModel)]="workSchedule.lunchEnd" name="lunchEnd">
                    </div>
                  </div>
                </div>

                <div class="schedule-card">
                  <h4>Dias de Trabalho</h4>
                  <div class="days-selector">
                    @for (day of weekDays; track day.value) {
                      <label class="day-checkbox" [class.selected]="workSchedule.workDays.includes(day.value)">
                        <input type="checkbox" [checked]="workSchedule.workDays.includes(day.value)" (change)="toggleWorkDay(day.value)">
                        <span>{{ day.short }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="info-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <p>Carga horária calculada: <strong>{{ calculateWorkHours() }}h semanais</strong></p>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar Configurações
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Seção: Férias e Folgas -->
          @if (activeSection() === 'vacation') {
            <div class="content-section">
              <div class="section-header">
                <h2>Férias e Folgas</h2>
                <p>Configure as políticas de férias e folgas</p>
              </div>

              <form class="settings-form" (ngSubmit)="saveVacationSettings()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Dias de Férias por Ano</label>
                    <input type="number" [(ngModel)]="vacationSettings.daysPerYear" name="daysPerYear" min="0" max="60">
                  </div>
                  <div class="form-group">
                    <label>Mínimo de Dias Consecutivos</label>
                    <input type="number" [(ngModel)]="vacationSettings.minConsecutiveDays" name="minDays" min="1">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Antecedência Mínima (dias)</label>
                    <input type="number" [(ngModel)]="vacationSettings.advanceNoticeDays" name="notice" min="1">
                  </div>
                  <div class="form-group">
                    <label>Máximo de Parcelamentos</label>
                    <input type="number" [(ngModel)]="vacationSettings.maxSplits" name="splits" min="1" max="3">
                  </div>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Permitir Venda de Férias</span>
                    <span class="toggle-desc">Funcionários podem vender até 1/3 das férias</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="vacationSettings.allowSell" name="allowSell">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Aprovação Obrigatória</span>
                    <span class="toggle-desc">Férias precisam de aprovação do gestor</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="vacationSettings.requireApproval" name="requireApproval">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="section-subtitle">Feriados Nacionais</div>
                <div class="holidays-list">
                  @for (holiday of holidays; track holiday.date) {
                    <div class="holiday-item">
                      <span class="holiday-date">{{ formatDate(holiday.date) }}</span>
                      <span class="holiday-name">{{ holiday.name }}</span>
                      <button type="button" class="btn-icon danger" (click)="removeHoliday(holiday)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  }
                </div>
                <button type="button" class="btn-text" (click)="addHoliday()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Adicionar Feriado
                </button>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Seção: Folha de Pagamento -->
          @if (activeSection() === 'payroll') {
            <div class="content-section">
              <div class="section-header">
                <h2>Folha de Pagamento</h2>
                <p>Configure as regras de cálculo da folha</p>
              </div>

              <form class="settings-form" (ngSubmit)="savePayrollSettings()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Dia de Fechamento</label>
                    <select [(ngModel)]="payrollSettings.closingDay" name="closingDay">
                      @for (day of [1,2,3,4,5,10,15,20,25,30]; track day) {
                        <option [value]="day">Dia {{ day }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Dia de Pagamento</label>
                    <select [(ngModel)]="payrollSettings.paymentDay" name="paymentDay">
                      @for (day of [1,5,10,15,20,25,30]; track day) {
                        <option [value]="day">Dia {{ day }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="section-subtitle">Descontos Automáticos</div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">INSS</span>
                    <span class="toggle-desc">Desconto automático conforme tabela vigente</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="payrollSettings.autoINSS" name="autoINSS">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">IRRF</span>
                    <span class="toggle-desc">Desconto automático conforme tabela vigente</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="payrollSettings.autoIRRF" name="autoIRRF">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">FGTS</span>
                    <span class="toggle-desc">Cálculo automático de 8% sobre salário bruto</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="payrollSettings.autoFGTS" name="autoFGTS">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="section-subtitle">Benefícios Padrão</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Vale Transporte (% desconto)</label>
                    <input type="number" [(ngModel)]="payrollSettings.vtDiscount" name="vtDiscount" min="0" max="6" step="0.5">
                  </div>
                  <div class="form-group">
                    <label>Vale Refeição (valor/dia)</label>
                    <input type="number" [(ngModel)]="payrollSettings.vrValue" name="vrValue" min="0" step="0.01">
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Seção: Segurança -->
          @if (activeSection() === 'security') {
            <div class="content-section">
              <div class="section-header">
                <h2>Segurança</h2>
                <p>Configure as políticas de segurança do sistema</p>
              </div>

              <div class="settings-form">
                <div class="section-subtitle">Política de Senhas</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tamanho Mínimo</label>
                    <input type="number" [(ngModel)]="securitySettings.minPasswordLength" min="6" max="20">
                  </div>
                  <div class="form-group">
                    <label>Expiração (dias)</label>
                    <input type="number" [(ngModel)]="securitySettings.passwordExpiration" min="0">
                    <span class="input-hint">0 = nunca expira</span>
                  </div>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Exigir caracteres especiais</span>
                    <span class="toggle-desc">Senhas devem conter !&#64;#$%^&*()</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="securitySettings.requireSpecialChars">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Exigir números</span>
                    <span class="toggle-desc">Senhas devem conter pelo menos um número</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="securitySettings.requireNumbers">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Exigir maiúsculas e minúsculas</span>
                    <span class="toggle-desc">Senhas devem misturar letras maiúsculas e minúsculas</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="securitySettings.requireMixedCase">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="section-subtitle">Sessão</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tempo de Inatividade (minutos)</label>
                    <input type="number" [(ngModel)]="securitySettings.sessionTimeout" min="5">
                  </div>
                  <div class="form-group">
                    <label>Máximo de Sessões Simultâneas</label>
                    <input type="number" [(ngModel)]="securitySettings.maxSessions" min="1" max="10">
                  </div>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Autenticação de Dois Fatores</span>
                    <span class="toggle-desc">Obrigar 2FA para todos os usuários</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="securitySettings.require2FA">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="form-actions">
                  <button class="btn-primary" (click)="saveSecuritySettings()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Seção: Email -->
          @if (activeSection() === 'email') {
            <div class="content-section">
              <div class="section-header">
                <h2>Configurações de Email</h2>
                <p>Configure o servidor SMTP para envio de emails</p>
              </div>

              <form class="settings-form" (ngSubmit)="saveEmailSettings()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Servidor SMTP</label>
                    <input type="text" [(ngModel)]="emailSettings.smtpServer" name="smtpServer" placeholder="smtp.gmail.com">
                  </div>
                  <div class="form-group">
                    <label>Porta</label>
                    <input type="number" [(ngModel)]="emailSettings.smtpPort" name="smtpPort" placeholder="587">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Email de Envio</label>
                    <input type="email" [(ngModel)]="emailSettings.senderEmail" name="senderEmail">
                  </div>
                  <div class="form-group">
                    <label>Nome do Remetente</label>
                    <input type="text" [(ngModel)]="emailSettings.senderName" name="senderName" placeholder="TalentFlow RH">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Usuário</label>
                    <input type="text" [(ngModel)]="emailSettings.username" name="username">
                  </div>
                  <div class="form-group">
                    <label>Senha</label>
                    <input type="password" [(ngModel)]="emailSettings.password" name="password">
                  </div>
                </div>

                <div class="toggle-setting">
                  <div class="toggle-info">
                    <span class="toggle-title">Usar TLS/SSL</span>
                    <span class="toggle-desc">Conexão segura com o servidor</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="emailSettings.useTLS" name="useTLS">
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" (click)="testEmail()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    Testar Conexão
                  </button>
                  <button type="submit" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Seção: Integrações -->
          @if (activeSection() === 'integrations') {
            <div class="content-section">
              <div class="section-header">
                <h2>Integrações</h2>
                <p>Conecte com outros serviços e plataformas</p>
              </div>

              <div class="integrations-grid">
                @for (integration of integrations; track integration.id) {
                  <div class="integration-card" [class.connected]="integration.connected">
                    <div class="integration-icon" [innerHTML]="integration.icon"></div>
                    <div class="integration-info">
                      <h4>{{ integration.name }}</h4>
                      <p>{{ integration.description }}</p>
                      @if (integration.connected && integration.lastSync) {
                        <span class="last-sync">Última sincronização: {{ integration.lastSync }}</span>
                      }
                    </div>
                    <div class="integration-actions">
                      @if (integration.connected) {
                        <button class="btn-connected" (click)="disconnectIntegration(integration)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                          Conectado
                        </button>
                      } @else {
                        <button class="btn-connect" (click)="connectIntegration(integration)">Conectar</button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Seção: Backup -->
          @if (activeSection() === 'backup') {
            <div class="content-section">
              <div class="section-header">
                <h2>Backup e Dados</h2>
                <p>Gerencie backups e exportação de dados</p>
              </div>

              <div class="backup-section">
                <div class="backup-card">
                  <div class="backup-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  </div>
                  <div class="backup-info">
                    <h4>Backup Automático</h4>
                    <p>Backups são realizados diariamente às 03:00</p>
                    <span class="backup-status">Último backup: {{ lastBackup }}</span>
                  </div>
                  <button class="btn-secondary" (click)="createBackup()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Backup Agora
                  </button>
                </div>

                <div class="backup-card">
                  <div class="backup-icon export">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div class="backup-info">
                    <h4>Exportar Dados</h4>
                    <p>Exporte todos os dados da empresa em formato CSV ou JSON</p>
                  </div>
                  <div class="btn-group">
                    <button class="btn-secondary" (click)="exportData('csv')">CSV</button>
                    <button class="btn-secondary" (click)="exportData('json')">JSON</button>
                  </div>
                </div>

                <div class="backup-card danger">
                  <div class="backup-icon danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </div>
                  <div class="backup-info">
                    <h4>Limpar Dados</h4>
                    <p>Remova todos os dados do sistema. Esta ação é irreversível.</p>
                  </div>
                  <button class="btn-danger" (click)="clearData()">Limpar Dados</button>
                </div>
              </div>
            </div>
          }

          <!-- Seção: Perfis e Permissões -->
          @if (activeSection() === 'roles') {
            <div class="content-section">
              <div class="section-header">
                <h2>Perfis e Permissões</h2>
                <p>Gerencie os níveis de acesso do sistema</p>
              </div>

              <div class="roles-list">
                @for (role of roles; track role.id) {
                  <div class="role-card">
                    <div class="role-header">
                      <div class="role-info">
                        <h4>{{ role.name }}</h4>
                        <span class="role-users">{{ role.usersCount }} usuários</span>
                      </div>
                      <button class="btn-icon" (click)="editRole(role)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                    <p class="role-description">{{ role.description }}</p>
                    <div class="permissions-preview">
                      @for (perm of role.permissions.slice(0, 4); track perm) {
                        <span class="permission-badge">{{ perm }}</span>
                      }
                      @if (role.permissions.length > 4) {
                        <span class="permission-more">+{{ role.permissions.length - 4 }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <button class="btn-secondary add-role" (click)="addRole()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Criar Novo Perfil
              </button>
            </div>
          }

          <!-- Seção: Logs de Auditoria -->
          @if (activeSection() === 'audit') {
            <div class="content-section">
              <div class="section-header">
                <h2>Logs de Auditoria</h2>
                <p>Visualize todas as ações realizadas no sistema</p>
              </div>

              <div class="audit-filters">
                <div class="filter-group">
                  <input type="text" placeholder="Buscar por usuário ou ação..." [(ngModel)]="auditFilter">
                </div>
                <div class="filter-group">
                  <select [(ngModel)]="auditTypeFilter">
                    <option value="">Todos os tipos</option>
                    <option value="LOGIN">Login</option>
                    <option value="CREATE">Criação</option>
                    <option value="UPDATE">Atualização</option>
                    <option value="DELETE">Exclusão</option>
                  </select>
                </div>
                <button class="btn-secondary" (click)="exportAuditLogs()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Exportar
                </button>
              </div>

              <div class="audit-table">
                <div class="table-header">
                  <span>Data/Hora</span>
                  <span>Usuário</span>
                  <span>Ação</span>
                  <span>Detalhes</span>
                  <span>IP</span>
                </div>
                @for (log of auditLogs; track log.id) {
                  <div class="table-row">
                    <span class="log-date">{{ log.timestamp }}</span>
                    <span class="log-user">{{ log.user }}</span>
                    <span class="log-action">
                      <span class="action-badge" [class]="log.type.toLowerCase()">{{ log.type }}</span>
                    </span>
                    <span class="log-details">{{ log.details }}</span>
                    <span class="log-ip">{{ log.ip }}</span>
                  </div>
                }
              </div>

              <div class="pagination">
                <button class="btn-icon" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span>Página {{ currentPage }} de {{ totalPages }}</span>
                <button class="btn-icon" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { width: 100%; }

    .settings-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 24px;
      margin-top: 24px;
    }

    /* Sidebar */
    .settings-sidebar {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 16px;
      height: fit-content;
      position: sticky;
      top: 24px;
    }

    .nav-section { margin-bottom: 20px; }
    .nav-section:last-child { margin-bottom: 0; }

    .nav-section-title {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 12px;
    }

    .settings-nav button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 12px;
      background: none;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .settings-nav button:hover { background: #f3f4f6; color: #111827; }
    .settings-nav button.active { background: #eff6ff; color: #3b82f6; font-weight: 500; }
    .settings-nav button svg { width: 18px; height: 18px; flex-shrink: 0; }

    /* Content */
    .settings-content { min-height: 600px; }

    .content-section {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 24px;
    }

    .section-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .section-header h2 { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 4px; }
    .section-header p { font-size: 14px; color: #6b7280; margin: 0; }

    .section-subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 24px 0 16px;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
    }

    /* Forms */
    .settings-form { max-width: 700px; }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row.three-cols { grid-template-columns: repeat(3, 1fr); }

    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; font-weight: 500; color: #374151; }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      color: #111827;
      transition: all 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-hint { font-size: 12px; color: #9ca3af; }

    .form-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 0;
      color: #9ca3af;
      font-size: 13px;
    }
    .form-divider::before,
    .form-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f3f4f6;
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #3b82f6;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary svg { width: 18px; height: 18px; }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-secondary svg { width: 18px; height: 18px; }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #fee2e2;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #dc2626;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger:hover { background: #fecaca; }

    .btn-text {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: none;
      border: none;
      font-size: 14px;
      color: #3b82f6;
      cursor: pointer;
      transition: color 0.2s;
    }
    .btn-text:hover { color: #2563eb; }
    .btn-text svg { width: 18px; height: 18px; }

    .btn-icon {
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #f3f4f6; color: #111827; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon.danger:hover { background: #fee2e2; color: #dc2626; }
    .btn-icon svg { width: 18px; height: 18px; }

    .btn-group { display: flex; gap: 8px; }

    /* Toggle */
    .toggle-setting {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .toggle-info { flex: 1; }
    .toggle-title { display: block; font-size: 14px; font-weight: 500; color: #111827; }
    .toggle-desc { font-size: 13px; color: #6b7280; }

    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: #e5e7eb;
      border-radius: 24px;
      transition: 0.3s;
    }
    .slider::before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    .toggle input:checked + .slider { background: #3b82f6; }
    .toggle input:checked + .slider::before { transform: translateX(20px); }

    /* Branding */
    .branding-section { max-width: 600px; }

    .logo-upload {
      display: flex;
      gap: 24px;
      align-items: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .current-logo {
      width: 100px;
      height: 100px;
      border-radius: 16px;
      overflow: hidden;
      background: white;
      border: 1px solid #e5e7eb;
    }
    .current-logo img { width: 100%; height: 100%; object-fit: cover; }

    .logo-actions h4 { margin: 0 0 4px; font-size: 15px; color: #111827; }
    .logo-actions p { margin: 0 0 12px; font-size: 13px; color: #6b7280; }

    .color-settings { margin-bottom: 24px; }
    .color-settings h4 { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px; }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .color-item label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 8px; }
    .color-picker {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .color-picker input[type="color"] {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
    }
    .color-picker span { font-size: 13px; color: #4b5563; font-family: monospace; }

    /* Schedule */
    .schedule-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .schedule-card h4 { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 16px; }

    .time-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .time-grid .form-group { margin-bottom: 0; }

    .days-selector {
      display: flex;
      gap: 8px;
    }

    .day-checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    .day-checkbox input { display: none; }
    .day-checkbox.selected { background: #3b82f6; border-color: #3b82f6; color: white; }
    .day-checkbox:hover { border-color: #3b82f6; }

    .info-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #eff6ff;
      border-radius: 10px;
      color: #1e40af;
      font-size: 14px;
      margin-top: 16px;
    }
    .info-box svg { width: 20px; height: 20px; flex-shrink: 0; }
    .info-box p { margin: 0; }

    /* Holidays */
    .holidays-list { margin-bottom: 12px; }
    .holiday-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .holiday-date { font-size: 13px; color: #6b7280; width: 100px; }
    .holiday-name { flex: 1; font-size: 14px; color: #111827; }

    /* Integrations */
    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .integration-card {
      display: flex;
      flex-direction: column;
      padding: 20px;
      background: #f9fafb;
      border: 2px solid transparent;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .integration-card.connected { border-color: #22c55e; background: #f0fdf4; }

    .integration-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .integration-icon :deep(svg) { width: 28px; height: 28px; color: #3b82f6; }

    .integration-info h4 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px; }
    .integration-info p { font-size: 13px; color: #6b7280; margin: 0 0 8px; }
    .last-sync { font-size: 12px; color: #22c55e; }

    .integration-actions { margin-top: auto; padding-top: 12px; }

    .btn-connect {
      padding: 8px 16px;
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-connect:hover { background: #2563eb; }

    .btn-connected {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #dcfce7;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #16a34a;
      cursor: pointer;
    }
    .btn-connected svg { width: 16px; height: 16px; }

    /* Backup */
    .backup-section { display: flex; flex-direction: column; gap: 16px; }

    .backup-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    .backup-card.danger { background: #fef2f2; }

    .backup-icon {
      width: 56px;
      height: 56px;
      background: #dbeafe;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }
    .backup-icon.export { background: #d1fae5; color: #16a34a; }
    .backup-icon.danger { background: #fee2e2; color: #dc2626; }
    .backup-icon svg { width: 28px; height: 28px; }

    .backup-info { flex: 1; }
    .backup-info h4 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px; }
    .backup-info p { font-size: 13px; color: #6b7280; margin: 0; }
    .backup-status { display: block; font-size: 12px; color: #22c55e; margin-top: 4px; }

    /* Roles */
    .roles-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }

    .role-card {
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .role-info h4 { font-size: 15px; font-weight: 600; color: #111827; margin: 0; }
    .role-users { font-size: 12px; color: #6b7280; }

    .role-description { font-size: 13px; color: #6b7280; margin: 0 0 12px; }

    .permissions-preview { display: flex; flex-wrap: wrap; gap: 6px; }
    .permission-badge {
      padding: 4px 10px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 20px;
      font-size: 12px;
    }
    .permission-more {
      padding: 4px 10px;
      background: #e5e7eb;
      color: #4b5563;
      border-radius: 20px;
      font-size: 12px;
    }

    .add-role { margin-top: 8px; }

    /* Audit */
    .audit-filters {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .filter-group { flex: 1; }
    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }

    .audit-table {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 150px 140px 100px 1fr 120px;
      padding: 12px 16px;
      background: #f9fafb;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
    }

    .table-row {
      display: grid;
      grid-template-columns: 150px 140px 100px 1fr 120px;
      padding: 14px 16px;
      border-top: 1px solid #f3f4f6;
      align-items: center;
    }
    .table-row:hover { background: #f9fafb; }

    .log-date { font-size: 13px; color: #6b7280; }
    .log-user { font-size: 14px; color: #111827; font-weight: 500; }
    .log-details { font-size: 13px; color: #4b5563; }
    .log-ip { font-size: 13px; color: #9ca3af; font-family: monospace; }

    .action-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .action-badge.login { background: #dbeafe; color: #1e40af; }
    .action-badge.create { background: #d1fae5; color: #16a34a; }
    .action-badge.update { background: #fef3c7; color: #b45309; }
    .action-badge.delete { background: #fee2e2; color: #dc2626; }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
      font-size: 14px;
      color: #6b7280;
    }

    @media (max-width: 1024px) {
      .settings-layout { grid-template-columns: 1fr; }
      .settings-sidebar { position: static; }
      .form-row { grid-template-columns: 1fr; }
      .form-row.three-cols { grid-template-columns: 1fr; }
      .integrations-grid { grid-template-columns: 1fr; }
      .color-grid { grid-template-columns: 1fr; }
      .table-header, .table-row { grid-template-columns: 1fr; gap: 8px; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  activeSection = signal<string>('company');

  companySettings: CompanySettings = {
    name: 'TalentFlow',
    cnpj: '',
    email: 'contato@talentflow.com',
    phone: '',
    website: '',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: ''
  };

  brandingSettings = {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981'
  };

  workSchedule: WorkSchedule = {
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: ['SEG', 'TER', 'QUA', 'QUI', 'SEX']
  };

  weekDays = [
    { value: 'DOM', short: 'D' },
    { value: 'SEG', short: 'S' },
    { value: 'TER', short: 'T' },
    { value: 'QUA', short: 'Q' },
    { value: 'QUI', short: 'Q' },
    { value: 'SEX', short: 'S' },
    { value: 'SAB', short: 'S' }
  ];

  vacationSettings = {
    daysPerYear: 30,
    minConsecutiveDays: 10,
    advanceNoticeDays: 30,
    maxSplits: 3,
    allowSell: true,
    requireApproval: true
  };

  holidays = [
    { date: '2026-01-01', name: 'Confraternização Universal' },
    { date: '2026-04-21', name: 'Tiradentes' },
    { date: '2026-05-01', name: 'Dia do Trabalho' },
    { date: '2026-09-07', name: 'Independência do Brasil' },
    { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
    { date: '2026-11-02', name: 'Finados' },
    { date: '2026-11-15', name: 'Proclamação da República' },
    { date: '2026-12-25', name: 'Natal' }
  ];

  payrollSettings = {
    closingDay: 25,
    paymentDay: 5,
    autoINSS: true,
    autoIRRF: true,
    autoFGTS: true,
    vtDiscount: 6,
    vrValue: 35
  };

  securitySettings = {
    minPasswordLength: 8,
    passwordExpiration: 90,
    requireSpecialChars: true,
    requireNumbers: true,
    requireMixedCase: true,
    sessionTimeout: 30,
    maxSessions: 3,
    require2FA: false
  };

  emailSettings = {
    smtpServer: '',
    smtpPort: 587,
    senderEmail: '',
    senderName: 'TalentFlow RH',
    username: '',
    password: '',
    useTLS: true
  };

  integrations: IntegrationConfig[] = [
    { id: 'google', name: 'Google Workspace', description: 'Sincronize com Google Calendar e Drive', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>', connected: false },
    { id: 'slack', name: 'Slack', description: 'Notificações e integrações com Slack', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>', connected: true, lastSync: 'Há 2 horas' },
    { id: 'esocial', name: 'eSocial', description: 'Integração com o sistema eSocial do governo', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>', connected: false },
    { id: 'banking', name: 'Banco (Folha)', description: 'Integração bancária para pagamentos', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>', connected: false }
  ];

  lastBackup = 'Hoje às 03:00';

  roles = [
    { id: 1, name: 'Administrador', description: 'Acesso total ao sistema', usersCount: 2, permissions: ['Gerenciar Usuários', 'Configurações', 'Relatórios', 'Folha de Pagamento', 'Recrutamento'] },
    { id: 2, name: 'RH', description: 'Gestão de recursos humanos', usersCount: 5, permissions: ['Funcionários', 'Férias', 'Documentos', 'Recrutamento'] },
    { id: 3, name: 'Gestor', description: 'Gerenciamento de equipe', usersCount: 12, permissions: ['Ver Equipe', 'Aprovar Férias', 'Avaliações'] },
    { id: 4, name: 'Funcionário', description: 'Acesso básico ao portal', usersCount: 150, permissions: ['Perfil', 'Contracheques', 'Férias'] }
  ];

  auditLogs = [
    { id: 1, timestamp: '16/01/2026 14:32', user: 'admin@talentflow.com', type: 'LOGIN', details: 'Login realizado com sucesso', ip: '192.168.1.100' },
    { id: 2, timestamp: '16/01/2026 14:28', user: 'maria@empresa.com', type: 'UPDATE', details: 'Atualização de perfil do funcionário #42', ip: '192.168.1.105' },
    { id: 3, timestamp: '16/01/2026 14:15', user: 'joao@empresa.com', type: 'CREATE', details: 'Nova solicitação de férias criada', ip: '192.168.1.110' },
    { id: 4, timestamp: '16/01/2026 13:45', user: 'admin@talentflow.com', type: 'DELETE', details: 'Documento #123 removido', ip: '192.168.1.100' },
    { id: 5, timestamp: '16/01/2026 12:30', user: 'ana@empresa.com', type: 'LOGIN', details: 'Login realizado com sucesso', ip: '192.168.1.115' }
  ];

  auditFilter = '';
  auditTypeFilter = '';
  currentPage = 1;
  totalPages = 10;

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Carregaria as configurações do backend
  }

  saveCompanySettings(): void {
    this.toastService.success('Dados da empresa salvos com sucesso!');
  }

  uploadLogo(): void {
    this.toastService.info('Funcionalidade de upload em desenvolvimento');
  }

  previewColors(): void {
    // Preview das cores
  }

  resetBranding(): void {
    this.brandingSettings = {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#10b981'
    };
    this.toastService.info('Cores restauradas para o padrão');
  }

  saveBranding(): void {
    this.toastService.success('Configurações de marca salvas!');
  }

  toggleWorkDay(day: string): void {
    const index = this.workSchedule.workDays.indexOf(day);
    if (index > -1) {
      this.workSchedule.workDays.splice(index, 1);
    } else {
      this.workSchedule.workDays.push(day);
    }
  }

  calculateWorkHours(): string {
    const start = this.workSchedule.startTime.split(':').map(Number);
    const end = this.workSchedule.endTime.split(':').map(Number);
    const lunchStart = this.workSchedule.lunchStart.split(':').map(Number);
    const lunchEnd = this.workSchedule.lunchEnd.split(':').map(Number);

    const totalMinutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    const lunchMinutes = (lunchEnd[0] * 60 + lunchEnd[1]) - (lunchStart[0] * 60 + lunchStart[1]);
    const workMinutes = totalMinutes - lunchMinutes;
    const dailyHours = workMinutes / 60;
    const weeklyHours = dailyHours * this.workSchedule.workDays.length;

    return weeklyHours.toFixed(0);
  }

  saveSchedule(): void {
    this.toastService.success('Horários de trabalho salvos!');
  }

  formatDate(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  addHoliday(): void {
    this.toastService.info('Funcionalidade em desenvolvimento');
  }

  removeHoliday(holiday: any): void {
    this.holidays = this.holidays.filter(h => h !== holiday);
    this.toastService.success('Feriado removido');
  }

  saveVacationSettings(): void {
    this.toastService.success('Configurações de férias salvas!');
  }

  savePayrollSettings(): void {
    this.toastService.success('Configurações de folha salvas!');
  }

  saveSecuritySettings(): void {
    this.toastService.success('Configurações de segurança salvas!');
  }

  saveEmailSettings(): void {
    this.toastService.success('Configurações de email salvas!');
  }

  testEmail(): void {
    this.toastService.info('Enviando email de teste...');
    setTimeout(() => {
      this.toastService.success('Email de teste enviado com sucesso!');
    }, 2000);
  }

  connectIntegration(integration: IntegrationConfig): void {
    integration.connected = true;
    integration.lastSync = 'Agora';
    this.toastService.success(`${integration.name} conectado com sucesso!`);
  }

  disconnectIntegration(integration: IntegrationConfig): void {
    integration.connected = false;
    integration.lastSync = undefined;
    this.toastService.info(`${integration.name} desconectado`);
  }

  createBackup(): void {
    this.toastService.info('Criando backup...');
    setTimeout(() => {
      this.lastBackup = 'Agora';
      this.toastService.success('Backup criado com sucesso!');
    }, 3000);
  }

  exportData(format: 'csv' | 'json'): void {
    this.toastService.info(`Exportando dados em ${format.toUpperCase()}...`);
    setTimeout(() => {
      this.toastService.success('Dados exportados com sucesso!');
    }, 2000);
  }

  clearData(): void {
    if (confirm('ATENÇÃO: Esta ação é irreversível. Deseja realmente limpar todos os dados?')) {
      this.toastService.error('Operação cancelada por segurança');
    }
  }

  editRole(role: any): void {
    this.toastService.info('Editor de perfil em desenvolvimento');
  }

  addRole(): void {
    this.toastService.info('Criação de perfil em desenvolvimento');
  }

  exportAuditLogs(): void {
    this.toastService.success('Logs exportados com sucesso!');
  }
}

