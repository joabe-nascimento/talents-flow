import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

const TOKEN_KEY = 'talentflow_token';
const USER_KEY = 'talentflow_user';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Logo Section -->
        <div class="sidebar-brand">
          <div class="brand-logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">TalentFlow</span>
              <span class="brand-tagline">HR Management</span>
            </div>
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (section of navSections; track section.title) {
            <div class="nav-section">
              <span class="section-title">{{ section.title }}</span>
              @for (item of section.items; track item.path) {
                <a 
                  [routerLink]="item.path" 
                  routerLinkActive="active" 
                  [routerLinkActiveOptions]="{exact: item.exact || false}"
                  class="nav-link"
                >
                  <span class="nav-icon" [innerHTML]="item.icon"></span>
                  <span class="nav-label">{{ item.label }}</span>
                  <span class="nav-indicator"></span>
                </a>
              }
            </div>
          }
        </nav>

        <!-- User Section -->
        <div class="sidebar-user">
          <div class="user-card">
            <div class="user-avatar">
              <span>{{ getUserInitials() }}</span>
              <span class="status-dot"></span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || 'Usuário' }}</span>
              <span class="user-role">{{ getRoleLabel() }}</span>
            </div>
            <button class="btn-menu" (click)="showUserMenu = !showUserMenu">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          @if (showUserMenu) {
            <div class="user-dropdown">
              <button class="dropdown-item" (click)="logout()">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Sair do Sistema
              </button>
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" [class.expanded]="sidebarCollapsed()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .layout {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #0c1222 0%, #1a2642 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar.collapsed .brand-text,
    .sidebar.collapsed .nav-label,
    .sidebar.collapsed .section-title,
    .sidebar.collapsed .user-info {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar.collapsed .collapse-btn svg {
      transform: rotate(180deg);
    }

    /* Brand Section */
    .sidebar-brand {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .logo-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .brand-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.025em;
    }

    .brand-tagline {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 2px;
    }

    .collapse-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .collapse-btn svg {
      width: 16px;
      height: 16px;
      color: #94a3b8;
      transition: transform 0.3s ease;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .section-title {
      display: block;
      padding: 0 1.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #475569;
      transition: all 0.3s ease;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 1.5rem;
      margin: 0.125rem 0.75rem;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      position: relative;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-link.active {
      color: white;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
    }

    .nav-link.active .nav-indicator {
      opacity: 1;
      transform: scaleY(1);
    }

    .nav-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 24px;
      background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
      border-radius: 0 4px 4px 0;
      opacity: 0;
      transition: all 0.2s ease;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon svg {
      width: 20px;
      height: 20px;
    }

    .nav-label {
      white-space: nowrap;
      transition: all 0.3s ease;
    }

    /* User Section */
    .sidebar-user {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      position: relative;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.2s ease;
    }

    .user-card:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: white;
      position: relative;
      flex-shrink: 0;
    }

    .status-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border: 2px solid #0c1222;
      border-radius: 50%;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      transition: all 0.3s ease;
    }

    .user-name {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
      text-transform: capitalize;
      margin-top: 2px;
    }

    .btn-menu {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .btn-menu:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }

    .btn-menu svg {
      width: 18px;
      height: 18px;
    }

    .user-dropdown {
      position: absolute;
      bottom: 100%;
      left: 1rem;
      right: 1rem;
      margin-bottom: 0.5rem;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.5rem;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.875rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dropdown-item:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .dropdown-item svg {
      width: 18px;
      height: 18px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .main-content.expanded {
      margin-left: 80px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 80px;
      }

      .sidebar .brand-text,
      .sidebar .nav-label,
      .sidebar .section-title,
      .sidebar .user-info {
        display: none;
      }

      .main-content {
        margin-left: 80px;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;
  sidebarCollapsed = signal(false);

  navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          exact: true,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`
        }
      ]
    },
    {
      title: 'Gestão',
      items: [
        { 
          path: '/dashboard/employees', 
          label: 'Funcionários',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        },
        { 
          path: '/dashboard/departments', 
          label: 'Departamentos',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
        },
        { 
          path: '/dashboard/vacations', 
          label: 'Férias',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
        }
      ]
    },
    {
      title: 'Recrutamento',
      items: [
        { 
          path: '/dashboard/jobs', 
          label: 'Vagas',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
        },
        { 
          path: '/dashboard/candidates', 
          label: 'Candidatos',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`
        },
        { 
          path: '/dashboard/pipeline', 
          label: 'Pipeline',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
        }
      ]
    },
    {
      title: 'Análises',
      items: [
        { 
          path: '/dashboard/reports', 
          label: 'Relatórios',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
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

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }
}
