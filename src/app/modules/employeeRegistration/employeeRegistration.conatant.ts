import { IEmployeeFilterableFields } from './employeeRegistration.interface';

export const employeeFilterableFilds: IEmployeeFilterableFields[] = [
  'searchTerm',
  'name',
  'dateOfBirth',
  'phoneNo',
  'email',
];

export const employeeSearchableFields = ['name', 'phoneNo', 'email'];
