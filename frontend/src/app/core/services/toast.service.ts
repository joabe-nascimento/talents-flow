import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 5000);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}


