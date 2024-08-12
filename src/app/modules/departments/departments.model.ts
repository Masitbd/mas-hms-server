import { model, Schema } from 'mongoose';
import { IDepartment } from './departments.interfaces';

const DepartmentSchema = new Schema<IDepartment>(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
      unique: true,
    },
    commissionParcentage: {
      type: Number,
      default: 0,
      required: true,
    },
    isCommissionFiexed: {
      type: Boolean,
    },
    fixedCommission: {
      type: Number,
      default: 0,
      required: true,
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Department = model<IDepartment>('Departments', DepartmentSchema);
