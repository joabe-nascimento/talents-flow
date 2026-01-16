import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Hubs
      {
        path: 'people',
        loadComponent: () => import('./features/hub/people-hub.component').then(m => m.PeopleHubComponent)
      },
      {
        path: 'recruitment',
        loadComponent: () => import('./features/hub/recruitment-hub.component').then(m => m.RecruitmentHubComponent)
      },
      {
        path: 'management',
        loadComponent: () => import('./features/hub/management-hub.component').then(m => m.ManagementHubComponent)
      },
      {
        path: 'finance',
        loadComponent: () => import('./features/hub/finance-hub.component').then(m => m.FinanceHubComponent)
      },
      // Sub-pages
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/departments/department-list/department-list.component').then(m => m.DepartmentListComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent)
      },
      {
        path: 'candidates',
        loadComponent: () => import('./features/candidates/candidate-list/candidate-list.component').then(m => m.CandidateListComponent)
      },
      {
        path: 'pipeline',
        loadComponent: () => import('./features/candidates/candidate-pipeline/candidate-pipeline.component').then(m => m.CandidatePipelineComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'vacations',
        loadComponent: () => import('./features/vacations/vacation-management.component').then(m => m.VacationManagementComponent)
      },
      {
        path: 'performance',
        loadComponent: () => import('./features/performance/performance-review.component').then(m => m.PerformanceReviewComponent)
      },
      {
        path: 'payroll',
        loadComponent: () => import('./features/payroll/payroll.component').then(m => m.PayrollComponent)
      },
      {
        path: 'time-records',
        loadComponent: () => import('./features/time-records/time-records.component').then(m => m.TimeRecordsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent)
      },
      {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
      },
      {
        path: 'offboarding',
        loadComponent: () => import('./features/offboarding/offboarding.component').then(m => m.OffboardingComponent)
      },
      {
        path: 'org-chart',
        loadComponent: () => import('./features/org-chart/org-chart.component').then(m => m.OrgChartComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
