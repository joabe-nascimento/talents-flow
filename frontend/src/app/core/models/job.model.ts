export interface JobPosition {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  departmentId?: number;
  departmentName?: string;
  salaryMin?: number;
  salaryMax?: number;
  type: JobType;
  status: JobStatus;
  openingDate?: string;
  closingDate?: string;
  candidateCount?: number;
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE'
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
  FILLED = 'FILLED'
}

