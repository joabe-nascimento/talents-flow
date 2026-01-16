import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="profile-page">
      <app-page-header 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais">
      </app-page-header>

      <div class="profile-layout">
        <!-- Sidebar do Perfil -->
        <aside class="profile-sidebar">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img [src]="getAvatarUrl()" alt="Avatar" class="avatar-img">
              <button class="avatar-edit" (click)="changeAvatar()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            <h2 class="user-name">{{ profile().name }}</h2>
            <p class="user-role">{{ profile().position || profile().role }}</p>
            <p class="user-department">{{ profile().department }}</p>
          </div>

          <div class="stats-section">
            <div class="stat">
              <span class="stat-value">{{ getDaysWorked() }}</span>
              <span class="stat-label">Dias na empresa</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ getYearsWorked() }}</span>
              <span class="stat-label">Anos</span>
            </div>
          </div>

          <nav class="profile-nav">
            <button 
              [class.active]="activeTab() === 'info'" 
              (click)="activeTab.set('info')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Informações
            </button>
            <button 
              [class.active]="activeTab() === 'security'" 
              (click)="activeTab.set('security')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Segurança
            </button>
            <button 
              [class.active]="activeTab() === 'notifications'" 
              (click)="activeTab.set('notifications')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Notificações
            </button>
            <button 
              [class.active]="activeTab() === 'preferences'" 
              (click)="activeTab.set('preferences')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Preferências
            </button>
          </nav>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="profile-content">
          <!-- Tab: Informações -->
          @if (activeTab() === 'info') {
            <div class="content-card">
              <div class="card-header">
                <h3>Informações Pessoais</h3>
                <button class="btn-edit" (click)="toggleEdit()" [class.active]="isEditing()">
                  @if (isEditing()) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    Cancelar
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  }
                </button>
              </div>

              <form class="profile-form" (ngSubmit)="saveProfile()">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" [(ngModel)]="editForm.name" name="name" [disabled]="!isEditing()">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="editForm.email" name="email" [disabled]="!isEditing()">
                  </div>
                  <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" [(ngModel)]="editForm.phone" name="phone" [disabled]="!isEditing()" placeholder="(00) 00000-0000">
                  </div>
                  <div class="form-group">
                    <label>Localização</label>
                    <input type="text" [(ngModel)]="editForm.location" name="location" [disabled]="!isEditing()" placeholder="Cidade, Estado">
                  </div>
                </div>

                <div class="form-group full-width">
                  <label>Bio</label>
                  <textarea [(ngModel)]="editForm.bio" name="bio" [disabled]="!isEditing()" rows="3" placeholder="Conte um pouco sobre você..."></textarea>
                </div>

                @if (isEditing()) {
                  <div class="form-actions">
                    <button type="submit" class="btn-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Salvar Alterações
                    </button>
                  </div>
                }
              </form>
            </div>

            <div class="content-card">
              <div class="card-header">
                <h3>Informações Profissionais</h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Cargo</span>
                  <span class="info-value">{{ profile().position || 'Não informado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Departamento</span>
                  <span class="info-value">{{ profile().department || 'Não informado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Data de Admissão</span>
                  <span class="info-value">{{ formatDate(profile().hireDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Nível de Acesso</span>
                  <span class="info-value badge">{{ getRoleLabel(profile().role) }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Tab: Segurança -->
          @if (activeTab() === 'security') {
            <div class="content-card">
              <div class="card-header">
                <h3>Alterar Senha</h3>
              </div>
              <form class="security-form" (ngSubmit)="changePassword()">
                <div class="form-group">
                  <label>Senha Atual</label>
                  <div class="password-input">
                    <input [type]="showCurrentPassword() ? 'text' : 'password'" [(ngModel)]="passwordForm.currentPassword" name="currentPassword" required>
                    <button type="button" class="toggle-password" (click)="showCurrentPassword.set(!showCurrentPassword())">
                      @if (showCurrentPassword()) {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Nova Senha</label>
                  <div class="password-input">
                    <input [type]="showNewPassword() ? 'text' : 'password'" [(ngModel)]="passwordForm.newPassword" name="newPassword" required minlength="8">
                    <button type="button" class="toggle-password" (click)="showNewPassword.set(!showNewPassword())">
                      @if (showNewPassword()) {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <div class="password-strength">
                    <div class="strength-bar" [class]="getPasswordStrength()"></div>
                    <span>{{ getPasswordStrengthLabel() }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" required>
                  @if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
                    <span class="error-text">As senhas não coincidem</span>
                  }
                </div>
                <button type="submit" class="btn-primary" [disabled]="!isPasswordValid()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Alterar Senha
                </button>
              </form>
            </div>

            <div class="content-card">
              <div class="card-header">
                <h3>Autenticação de Dois Fatores</h3>
                <span class="badge" [class.active]="twoFactorEnabled()">{{ twoFactorEnabled() ? 'Ativo' : 'Inativo' }}</span>
              </div>
              <p class="security-description">
                Adicione uma camada extra de segurança à sua conta exigindo um código de verificação além da sua senha.
              </p>
              @if (!twoFactorEnabled()) {
                <button class="btn-secondary" (click)="enable2FA()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Ativar 2FA
                </button>
              } @else {
                <button class="btn-danger" (click)="disable2FA()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Desativar 2FA
                </button>
              }
            </div>

            <div class="content-card">
              <div class="card-header">
                <h3>Sessões Ativas</h3>
              </div>
              <div class="sessions-list">
                @for (session of activeSessions(); track session.id) {
                  <div class="session-item" [class.current]="session.current">
                    <div class="session-icon">
                      @if (session.device === 'desktop') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      }
                    </div>
                    <div class="session-info">
                      <span class="session-name">{{ session.browser }} - {{ session.os }}</span>
                      <span class="session-location">{{ session.location }} · {{ session.lastActive }}</span>
                    </div>
                    @if (session.current) {
                      <span class="current-badge">Sessão atual</span>
                    } @else {
                      <button class="btn-icon danger" (click)="revokeSession(session.id)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tab: Notificações -->
          @if (activeTab() === 'notifications') {
            <div class="content-card">
              <div class="card-header">
                <h3>Preferências de Notificação</h3>
              </div>
              <div class="notification-settings">
                <div class="notification-category">
                  <h4>Email</h4>
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">Atualizações do sistema</span>
                      <span class="notification-desc">Novidades e atualizações importantes</span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="notificationSettings.emailUpdates">
                      <span class="slider"></span>
                    </label>
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">Solicitações pendentes</span>
                      <span class="notification-desc">Férias, documentos e aprovações</span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="notificationSettings.emailRequests">
                      <span class="slider"></span>
                    </label>
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">Avaliações de desempenho</span>
                      <span class="notification-desc">Novas avaliações e feedback</span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="notificationSettings.emailReviews">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="notification-category">
                  <h4>Push (Navegador)</h4>
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">Mensagens</span>
                      <span class="notification-desc">Notificações de chat e mensagens</span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="notificationSettings.pushMessages">
                      <span class="slider"></span>
                    </label>
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">Lembretes</span>
                      <span class="notification-desc">Tarefas e prazos importantes</span>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="notificationSettings.pushReminders">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              <button class="btn-primary" (click)="saveNotificationSettings()">Salvar Preferências</button>
            </div>
          }

          <!-- Tab: Preferências -->
          @if (activeTab() === 'preferences') {
            <div class="content-card">
              <div class="card-header">
                <h3>Aparência</h3>
              </div>
              <div class="preference-section">
                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-title">Tema</span>
                    <span class="preference-desc">Escolha entre claro ou escuro</span>
                  </div>
                  <div class="theme-selector">
                    <button [class.active]="selectedTheme() === 'light'" (click)="setTheme('light')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      Claro
                    </button>
                    <button [class.active]="selectedTheme() === 'dark'" (click)="setTheme('dark')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      Escuro
                    </button>
                    <button [class.active]="selectedTheme() === 'system'" (click)="setTheme('system')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      Sistema
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="content-card">
              <div class="card-header">
                <h3>Regional</h3>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Idioma</label>
                  <select [(ngModel)]="preferences.language">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Fuso Horário</label>
                  <select [(ngModel)]="preferences.timezone">
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Formato de Data</label>
                  <select [(ngModel)]="preferences.dateFormat">
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Moeda</label>
                  <select [(ngModel)]="preferences.currency">
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
              <button class="btn-primary" (click)="savePreferences()">Salvar Preferências</button>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { width: 100%; }

    .profile-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      margin-top: 24px;
    }

    /* Sidebar */
    .profile-sidebar {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 24px;
    }

    .avatar-section { text-align: center; margin-bottom: 24px; }

    .avatar-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #f3f4f6;
    }

    .avatar-edit {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 36px;
      height: 36px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .avatar-edit:hover { background: #2563eb; transform: scale(1.05); }
    .avatar-edit svg { width: 16px; height: 16px; }

    .user-name { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 4px; }
    .user-role { font-size: 14px; color: #6b7280; margin: 0 0 2px; }
    .user-department { font-size: 13px; color: #9ca3af; margin: 0; }

    .stats-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 16px 0;
      border-top: 1px solid #f3f4f6;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 16px;
    }

    .stat { text-align: center; }
    .stat-value { display: block; font-size: 24px; font-weight: 700; color: #3b82f6; }
    .stat-label { font-size: 12px; color: #6b7280; }

    .profile-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .profile-nav button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: none;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .profile-nav button:hover { background: #f3f4f6; color: #111827; }
    .profile-nav button.active { background: #eff6ff; color: #3b82f6; }
    .profile-nav button svg { width: 20px; height: 20px; flex-shrink: 0; }

    /* Content */
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .content-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .card-header h3 { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }

    .btn-edit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-edit:hover { background: #e5e7eb; }
    .btn-edit.active { background: #fee2e2; color: #dc2626; }
    .btn-edit svg { width: 16px; height: 16px; }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
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
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-group input:disabled,
    .form-group textarea:disabled {
      background: #f9fafb;
      color: #6b7280;
    }

    .form-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f3f4f6;
    }

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
    .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
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
    .btn-danger svg { width: 18px; height: 18px; }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .info-item {
      padding: 16px;
      background: #f9fafb;
      border-radius: 10px;
    }
    .info-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .info-value { font-size: 15px; font-weight: 500; color: #111827; }
    .info-value.badge {
      display: inline-block;
      padding: 4px 10px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 20px;
      font-size: 13px;
    }

    /* Security */
    .security-form { max-width: 400px; }
    .security-form .form-group { margin-bottom: 16px; }

    .password-input {
      position: relative;
    }
    .password-input input { width: 100%; padding-right: 44px; }
    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
    }
    .toggle-password:hover { color: #4b5563; }
    .toggle-password svg { width: 20px; height: 20px; }

    .password-strength {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      position: relative;
      overflow: hidden;
    }
    .strength-bar::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s;
    }
    .strength-bar.weak::before { width: 33%; background: #ef4444; }
    .strength-bar.medium::before { width: 66%; background: #f59e0b; }
    .strength-bar.strong::before { width: 100%; background: #22c55e; }
    .password-strength span { font-size: 12px; color: #6b7280; }

    .error-text { font-size: 12px; color: #ef4444; margin-top: 4px; }

    .security-description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: #f3f4f6;
      color: #6b7280;
    }
    .badge.active { background: #dcfce7; color: #16a34a; }

    /* Sessions */
    .sessions-list { display: flex; flex-direction: column; gap: 12px; }

    .session-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 10px;
    }
    .session-item.current { background: #eff6ff; border: 1px solid #bfdbfe; }

    .session-icon {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
    }
    .session-icon svg { width: 20px; height: 20px; }

    .session-info { flex: 1; }
    .session-name { display: block; font-size: 14px; font-weight: 500; color: #111827; }
    .session-location { font-size: 13px; color: #6b7280; }

    .current-badge {
      padding: 4px 10px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-icon.danger { color: #ef4444; }
    .btn-icon.danger:hover { background: #fee2e2; }
    .btn-icon svg { width: 18px; height: 18px; }

    /* Notifications */
    .notification-settings { margin-bottom: 20px; }

    .notification-category {
      margin-bottom: 24px;
    }
    .notification-category h4 {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .notification-item:last-child { border-bottom: none; }

    .notification-info { flex: 1; }
    .notification-title { display: block; font-size: 14px; font-weight: 500; color: #111827; }
    .notification-desc { font-size: 13px; color: #6b7280; }

    /* Toggle Switch */
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

    /* Theme Selector */
    .preference-section { margin-bottom: 20px; }
    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .preference-info { flex: 1; }
    .preference-title { display: block; font-size: 14px; font-weight: 500; color: #111827; }
    .preference-desc { font-size: 13px; color: #6b7280; }

    .theme-selector {
      display: flex;
      gap: 8px;
    }
    .theme-selector button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      border: 2px solid transparent;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
    }
    .theme-selector button:hover { background: #e5e7eb; }
    .theme-selector button.active { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; }
    .theme-selector button svg { width: 18px; height: 18px; }

    @media (max-width: 900px) {
      .profile-layout { grid-template-columns: 1fr; }
      .profile-sidebar { position: static; }
      .form-grid { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  profile = signal<UserProfile>({
    id: 1,
    name: 'Administrador',
    email: 'admin@talentflow.com',
    phone: '(11) 99999-9999',
    role: 'ADMIN',
    position: 'Administrador do Sistema',
    department: 'Tecnologia',
    hireDate: '2020-01-15',
    bio: '',
    location: 'São Paulo, SP',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  activeTab = signal<'info' | 'security' | 'notifications' | 'preferences'>('info');
  isEditing = signal(false);
  twoFactorEnabled = signal(false);
  selectedTheme = signal<'light' | 'dark' | 'system'>('light');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  editForm = {
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notificationSettings = {
    emailUpdates: true,
    emailRequests: true,
    emailReviews: true,
    pushMessages: true,
    pushReminders: true
  };

  preferences = {
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL'
  };

  activeSessions = signal([
    { id: 1, device: 'desktop', browser: 'Chrome', os: 'Windows 10', location: 'São Paulo, BR', lastActive: 'Agora', current: true },
    { id: 2, device: 'mobile', browser: 'Safari', os: 'iOS 17', location: 'São Paulo, BR', lastActive: 'Há 2 horas', current: false },
    { id: 3, device: 'desktop', browser: 'Firefox', os: 'macOS', location: 'Rio de Janeiro, BR', lastActive: 'Ontem', current: false }
  ]);

  ngOnInit(): void {
    this.loadProfile();
    this.editForm = { ...this.profile() };
  }

  loadProfile(): void {
    const userStr = localStorage.getItem('talentflow_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.profile.update(p => ({ ...p, ...user }));
      this.editForm = { ...this.profile() };
    }
  }

  getAvatarUrl(): string {
    return `https://api.dicebear.com/8.x/initials/svg?seed=${this.profile().name}&backgroundColor=3b82f6`;
  }

  getDaysWorked(): number {
    if (!this.profile().hireDate) return 0;
    const hire = new Date(this.profile().hireDate!);
    const today = new Date();
    return Math.floor((today.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24));
  }

  getYearsWorked(): string {
    const days = this.getDaysWorked();
    const years = (days / 365).toFixed(1);
    return years;
  }

  formatDate(date?: string): string {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'HR': 'Recursos Humanos',
      'MANAGER': 'Gerente',
      'EMPLOYEE': 'Funcionário'
    };
    return labels[role] || role;
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.editForm = { ...this.profile() };
    }
    this.isEditing.set(!this.isEditing());
  }

  saveProfile(): void {
    this.profile.update(p => ({ ...p, ...this.editForm }));
    this.isEditing.set(false);
    this.toastService.success('Perfil atualizado com sucesso!');
  }

  changeAvatar(): void {
    this.toastService.info('Funcionalidade de upload em desenvolvimento');
  }

  getPasswordStrength(): string {
    const password = this.passwordForm.newPassword;
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    const labels: Record<string, string> = { weak: 'Fraca', medium: 'Média', strong: 'Forte' };
    return labels[strength] || '';
  }

  isPasswordValid(): boolean {
    return this.passwordForm.currentPassword.length > 0 &&
           this.passwordForm.newPassword.length >= 8 &&
           this.passwordForm.newPassword === this.passwordForm.confirmPassword;
  }

  changePassword(): void {
    if (!this.isPasswordValid()) return;
    this.toastService.success('Senha alterada com sucesso!');
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  enable2FA(): void {
    this.twoFactorEnabled.set(true);
    this.toastService.success('Autenticação de dois fatores ativada!');
  }

  disable2FA(): void {
    this.twoFactorEnabled.set(false);
    this.toastService.info('Autenticação de dois fatores desativada');
  }

  revokeSession(id: number): void {
    this.activeSessions.update(sessions => sessions.filter(s => s.id !== id));
    this.toastService.success('Sessão encerrada');
  }

  saveNotificationSettings(): void {
    this.toastService.success('Preferências de notificação salvas!');
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.selectedTheme.set(theme);
    localStorage.setItem('talentflow_theme', theme);
    this.toastService.success(`Tema ${theme === 'light' ? 'claro' : theme === 'dark' ? 'escuro' : 'do sistema'} aplicado`);
  }

  savePreferences(): void {
    this.toastService.success('Preferências salvas com sucesso!');
  }
}


