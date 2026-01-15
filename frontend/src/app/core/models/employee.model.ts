import { Role } from './user.model';

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  departmentId?: number;
  departmentName?: string;
  hireDate?: string;
  salary?: number;
  phone?: string;
  address?: string;
  birthDate?: string;
  status: EmployeeStatus;
  role: Role;
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED'
}

export interface CreateEmployeeRequest extends Omit<Employee, 'id' | 'departmentName'> {
  password: string;
}

