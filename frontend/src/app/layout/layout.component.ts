import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">TalentFlow</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/employees" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>Funcionários</span>
          </a>
          <a routerLink="/departments" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏢</span>
            <span>Departamentos</span>
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💼</span>
            <span>Vagas</span>
          </a>
          <a routerLink="/candidates" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>Candidatos</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.name }}</span>
              <span class="user-role">{{ currentUser?.role }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span>🚪</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
      }

      &.active {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border-left-color: #3b82f6;
      }
    }

    .nav-icon {
      font-size: 1.125rem;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .user-role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .btn-logout {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
      }

      span {
        font-size: 1.25rem;
      }
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 2rem;
      min-height: 100vh;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitials(): string {
    const name = this.currentUser?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

