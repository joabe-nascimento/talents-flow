import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
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
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
