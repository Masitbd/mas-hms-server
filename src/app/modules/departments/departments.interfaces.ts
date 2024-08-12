import { Model } from 'mongoose';

export type IDepartment = {
  label: string;
  value: string;
  commissionParcentage: number;
  fixedCommission: number;
  isCommissionFiexed: boolean;
  description?: string;
};

export type DepartmentModel = Model<IDepartment, Record<string, unknown>>;
