import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

const TOKEN_KEY = 'talentflow_token';
const USER_KEY = 'talentflow_user';
const SIDEBAR_KEY = 'talentflow_sidebar';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app" [class.collapsed]="collapsed()">
      <aside class="sidebar">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.8"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-name">TalentFlow</span>
        </div>

        <!-- Navigation -->
        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/dashboard/employees" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="7" r="3"/>
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <circle cx="17" cy="7" r="3"/>
              <path d="M21 21v-2a4 4 0 00-3-3.87"/>
            </svg>
            <span>Funcionários</span>
          </a>

          <a routerLink="/dashboard/departments" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span>Departamentos</span>
          </a>

          <a routerLink="/dashboard/jobs" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            <span>Vagas</span>
          </a>

          <a routerLink="/dashboard/candidates" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
            <span>Candidatos</span>
          </a>

          <a routerLink="/dashboard/pipeline" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span>Pipeline</span>
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/dashboard/vacations" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span>Férias</span>
          </a>

          <a routerLink="/dashboard/reports" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            <span>Relatórios</span>
          </a>
        </nav>

        <!-- Toggle Button -->
        <button class="btn-toggle" (click)="toggleSidebar()" [title]="collapsed() ? 'Expandir menu' : 'Recolher menu'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            @if (collapsed()) {
              <polyline points="9,18 15,12 9,6"/>
            } @else {
              <polyline points="15,18 9,12 15,6"/>
            }
          </svg>
        </button>

        <!-- User -->
        <div class="user">
          <div class="user-avatar">{{ getUserInitials() }}</div>
          <div class="user-info">
            <span class="user-name">{{ currentUser?.name || 'Usuário' }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <button class="btn-logout" (click)="logout()" title="Sair">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    .app {
      display: flex;
      min-height: 100vh;
      background: #f4f6f8;
    }

    .sidebar {
      width: 220px;
      background: #0f0f12;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Collapsed State */
    .app.collapsed .sidebar { width: 64px; }
    .app.collapsed .brand-name { opacity: 0; width: 0; }
    .app.collapsed .nav-item span { opacity: 0; width: 0; position: absolute; }
    .app.collapsed .user-info { opacity: 0; width: 0; position: absolute; }
    .app.collapsed .brand { justify-content: center; padding: 16px; }
    .app.collapsed .nav-item { justify-content: center; padding: 12px; }
    .app.collapsed .user { justify-content: center; gap: 0; }
    .app.collapsed .btn-logout { position: absolute; opacity: 0; }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      transition: all 0.25s ease;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      letter-spacing: -0.3px;
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 0.2s ease, width 0.25s ease;
    }

    /* Navigation */
    .nav {
      flex: 1;
      padding: 12px 8px;
      overflow-y: auto;
    }

    .nav::-webkit-scrollbar { width: 0; }

    .nav-divider {
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin: 8px 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      margin: 2px 0;
      border-radius: 8px;
      color: #71717a;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
      overflow: hidden;
    }

    .nav-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .nav-item span {
      white-space: nowrap;
      transition: opacity 0.2s ease, width 0.25s ease;
    }

    .nav-item:hover {
      color: #e4e4e7;
      background: rgba(255,255,255,0.04);
    }

    .nav-item.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1));
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: linear-gradient(180deg, #7c3aed, #a855f7);
      border-radius: 0 2px 2px 0;
    }

    /* Toggle Button */
    .btn-toggle {
      width: calc(100% - 16px);
      margin: 0 8px 8px;
      padding: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
      transition: all 0.15s ease;
    }

    .btn-toggle:hover {
      background: rgba(255,255,255,0.08);
      color: #e4e4e7;
    }

    .btn-toggle svg {
      width: 16px;
      height: 16px;
      transition: transform 0.25s ease;
    }

    .app.collapsed .btn-toggle { width: 48px; margin: 0 8px 8px; }

    /* User */
    .user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      position: relative;
      transition: all 0.25s ease;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      transition: opacity 0.2s ease, width 0.25s ease;
    }

    .user-name {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #e4e4e7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      display: block;
      font-size: 10px;
      color: #52525b;
      margin-top: 1px;
    }

    .btn-logout {
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #52525b;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .btn-logout:hover {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
    }

    .btn-logout svg {
      width: 16px;
      height: 16px;
    }

    /* Content */
    .content {
      flex: 1;
      margin-left: 220px;
      padding: 24px;
      min-height: 100vh;
      width: calc(100% - 220px);
      transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .app.collapsed .content {
      margin-left: 64px;
      width: calc(100% - 64px);
    }

    /* Global Content Styles */
    .content ::ng-deep .page {
      width: 100%;
      transition: width 0.25s ease;
    }

    .content ::ng-deep .pipeline {
      width: 100%;
    }

    .content ::ng-deep .grid,
    .content ::ng-deep .stats,
    .content ::ng-deep .kpis,
    .content ::ng-deep .reports-grid {
      width: 100%;
    }

    @media (max-width: 768px) {
      .sidebar { width: 64px; }
      .brand-name, .nav-item span, .user-info { display: none; }
      .brand { justify-content: center; padding: 16px; }
      .nav-item { justify-content: center; padding: 12px; }
      .user { justify-content: center; }
      .content { margin-left: 64px; }
      .btn-toggle { display: none; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  collapsed = signal(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadSidebarState();
  }

  private loadUser(): void {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private loadSidebarState(): void {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved === 'collapsed') {
      this.collapsed.set(true);
    }
  }

  toggleSidebar(): void {
    const newState = !this.collapsed();
    this.collapsed.set(newState);
    localStorage.setItem(SIDEBAR_KEY, newState ? 'collapsed' : 'expanded');
  }

  getUserInitials(): string {
    const name = this.currentUser?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const roles: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MANAGER': 'Gerente',
      'USER': 'Usuário'
    };
    return roles[this.currentUser?.role || ''] || this.currentUser?.role || '';
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }
}
