import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="page-header">
      <div class="header-left">
        @if (backLink) {
          <a [routerLink]="backLink" class="back-btn" [title]="'Voltar para ' + backLabel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </a>
        }
        <div class="header-info">
          @if (backLabel) {
            <span class="breadcrumb">{{ backLabel }}</span>
          }
          <h1>{{ title }}</h1>
          @if (subtitle) {
            <p>{{ subtitle }}</p>
          }
        </div>
      </div>
      <div class="header-right">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 10px;
      color: #71717a;
      text-decoration: none;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .back-btn:hover {
      background: #f4f4f5;
      color: #18181b;
      border-color: #d4d4d8;
    }

    .back-btn svg {
      width: 18px;
      height: 18px;
    }

    .header-info {
      display: flex;
      flex-direction: column;
    }

    .breadcrumb {
      font-size: 12px;
      color: #7c3aed;
      font-weight: 500;
      margin-bottom: 2px;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #18181b;
      margin: 0;
      line-height: 1.2;
    }

    p {
      font-size: 13px;
      color: #71717a;
      margin: 4px 0 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-right {
        width: 100%;
        flex-wrap: wrap;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() backLink = '';
  @Input() backLabel = '';
}


