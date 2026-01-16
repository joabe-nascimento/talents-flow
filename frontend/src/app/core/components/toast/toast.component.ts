import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              @default {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
            }
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      border-left: 4px solid;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast.success {
      border-left-color: #22c55e;
    }

    .toast.error {
      border-left-color: #ef4444;
    }

    .toast.warning {
      border-left-color: #f59e0b;
    }

    .toast.info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .toast-icon svg {
      width: 100%;
      height: 100%;
    }

    .toast.success .toast-icon { color: #22c55e; }
    .toast.error .toast-icon { color: #ef4444; }
    .toast.warning .toast-icon { color: #f59e0b; }
    .toast.info .toast-icon { color: #3b82f6; }

    .toast-message {
      flex: 1;
      font-size: 14px;
      color: #18181b;
      line-height: 1.4;
    }

    .toast-close {
      width: 20px;
      height: 20px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #a1a1aa;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #71717a;
    }

    .toast-close svg {
      width: 14px;
      height: 14px;
    }

    /* Dark mode support */
    :host-context(.dark) .toast {
      background: #27272a;
    }

    :host-context(.dark) .toast-message {
      color: #fafafa;
    }

    :host-context(.dark) .toast-close {
      color: #71717a;
    }

    :host-context(.dark) .toast-close:hover {
      color: #a1a1aa;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}


