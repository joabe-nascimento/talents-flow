import { Injectable, signal, effect } from '@angular/core';

const THEME_KEY = 'talentflow_theme';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>('light');

  constructor() {
    // Reset to light theme on app start
    localStorage.removeItem(THEME_KEY);
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    effect(() => {
      const currentTheme = this.theme();
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentTheme);
      localStorage.setItem(THEME_KEY, currentTheme);
    });
  }

  private getInitialTheme(): Theme {
    return 'light';
  }

  toggle(): void {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }
}


