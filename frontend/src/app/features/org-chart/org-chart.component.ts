import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

interface Employee {
  id: number;
  name: string;
  position: string;
  departmentName: string;
  managerId: number | null;
}

interface OrgNode {
  employee: Employee;
  children: OrgNode[];
}

@Component({
  selector: 'app-org-chart',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header 
        title="Organograma" 
        subtitle="Estrutura organizacional da empresa"
        backLink="/dashboard/people"
        backLabel="Pessoas">
      </app-page-header>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="org-container">
          @for (node of orgTree(); track node.employee.id) {
            <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: node, level: 0 }"></ng-container>
          }
        </div>
      }
    </div>

    <ng-template #nodeTemplate let-node="node" let-level="level">
      <div class="org-node" [style.margin-left.px]="level * 40">
        <div class="node-card">
          <div class="avatar" [style.background]="getAvatarColor(level)">
            {{ getInitials(node.employee.name) }}
          </div>
          <div class="info">
            <h3>{{ node.employee.name }}</h3>
            <span class="position">{{ node.employee.position }}</span>
            <span class="department">{{ node.employee.departmentName }}</span>
          </div>
        </div>
        @if (node.children.length > 0) {
          <div class="children">
            @for (child of node.children; track child.employee.id) {
              <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: child, level: level + 1 }"></ng-container>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    .page { width: 100%; }
    .header { margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 600; color: #18181b; margin: 0; }
    .header p { font-size: 13px; color: #71717a; margin: 4px 0 0; }

    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .spinner { width: 28px; height: 28px; border: 2px solid #e4e4e7; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .org-container { padding: 20px; background: white; border-radius: 12px; border: 1px solid #f4f4f5; }
    .org-node { margin-bottom: 12px; }
    .node-card { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fafafa; border-radius: 10px; border: 1px solid #e4e4e7; }
    .avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: white; }
    .info h3 { font-size: 14px; font-weight: 600; color: #18181b; margin: 0; }
    .position { display: block; font-size: 12px; color: #7c3aed; }
    .department { display: block; font-size: 11px; color: #71717a; }
    .children { margin-left: 20px; padding-left: 20px; border-left: 2px solid #e4e4e7; margin-top: 12px; }
  `]
})
export class OrgChartComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8085/api';
  
  orgTree = signal<OrgNode[]>([]);
  loading = signal(true);

  private colors = ['linear-gradient(135deg, #7c3aed, #a855f7)', 'linear-gradient(135deg, #2563eb, #3b82f6)', 
                   'linear-gradient(135deg, #16a34a, #22c55e)', 'linear-gradient(135deg, #d97706, #f59e0b)'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrgChart();
  }

  loadOrgChart(): void {
    this.http.get<Employee[]>(`${this.API_URL}/employees`).subscribe({
      next: (employees) => {
        const tree = this.buildTree(employees);
        this.orgTree.set(tree);
        this.loading.set(false);
      },
      error: () => { this.orgTree.set([]); this.loading.set(false); }
    });
  }

  buildTree(employees: Employee[]): OrgNode[] {
    const map = new Map<number, OrgNode>();
    const roots: OrgNode[] = [];

    employees.forEach(emp => {
      map.set(emp.id, { employee: emp, children: [] });
    });

    employees.forEach(emp => {
      const node = map.get(emp.id)!;
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(level: number): string {
    return this.colors[level % this.colors.length];
  }
}

