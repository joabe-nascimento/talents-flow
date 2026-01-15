import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'talentflow_token';
const USER_KEY = 'talentflow_user';

interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🎯</span>
            <h1>TalentFlow</h1>
          </div>
          <p>Sistema de Gestão de Talentos</p>
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          @if (error()) {
            <div class="error-alert">
              {{ error() }}
            </div>
          }

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
            }
            Entrar
          </button>
        </form>

        <div class="login-footer">
          <p class="demo-info">
            <strong>Demo:</strong> admin&#64;talentflow.com / admin123
          </p>
        </div>
      </div>

      <div class="login-bg">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
        <div class="bg-shape bg-shape-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      position: relative;
      overflow: hidden;
    }

    .login-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .bg-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
    }

    .bg-shape-1 {
      width: 600px;
      height: 600px;
      background: #3b82f6;
      top: -200px;
      right: -100px;
    }

    .bg-shape-2 {
      width: 400px;
      height: 400px;
      background: #06b6d4;
      bottom: -100px;
      left: -100px;
    }

    .bg-shape-3 {
      width: 300px;
      height: 300px;
      background: #8b5cf6;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .login-container {
      position: relative;
      z-index: 10;
      background: white;
      padding: 2.5rem;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;

        .logo-icon {
          font-size: 2rem;
        }

        h1 {
          margin: 0;
          font-size: 1.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      p {
        color: #64748b;
        margin: 0;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: #334155;
        font-size: 0.875rem;
      }

      .form-control {
        padding: 0.75rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }
    }

    .error-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-block {
      width: 100%;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .login-footer {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .demo-info {
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .demo-info strong {
      color: #334155;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Preencha todos os campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http.post<AuthResponse>('http://localhost:8085/api/auth/login', { 
      email: this.email, 
      password: this.password 
    }).subscribe({
      next: (response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role
        }));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email ou senha incorretos');
      }
    });
  }
}
