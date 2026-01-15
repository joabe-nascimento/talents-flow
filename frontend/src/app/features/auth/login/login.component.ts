import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

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
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      z-index: 1;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo h1 {
      font-size: 1.75rem;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .login-header p {
      color: #64748b;
      font-size: 0.9375rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn-block {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
    }

    .error-alert {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .demo-info {
      font-size: 0.8125rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.75rem;
      border-radius: 8px;
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
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Preencha todos os campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email ou senha incorretos');
      }
    });
  }
}

