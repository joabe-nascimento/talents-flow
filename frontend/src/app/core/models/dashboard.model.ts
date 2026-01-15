export interface DashboardData {
  totalEmployees: number;
  totalDepartments: number;
  openPositions: number;
  totalCandidates: number;
  pendingReviews?: number;
  departmentStats?: DepartmentStats[];
  recentCandidates?: RecentCandidate[];
}

export interface DepartmentStats {
  name: string;
  employeeCount: number;
}

export interface RecentCandidate {
  name: string;
  position: string;
  status: string;
}

