import { z } from 'zod';

const createDepartmentZodSchema = z.object({
  body: z.object({
    label: z.string({
      required_error: 'department name is required',
    }),
    value: z.string({
      required_error: 'department name is required',
    }),
    commissionParcentage: z.number({
      required_error: 'doctor commision percentage is required',
      invalid_type_error: 'doctor commision percentage must be a number',
    }),
    isCommissionFiexed: z.boolean({
      required_error: 'doctor commision percentage is required',
      invalid_type_error: 'doctor commision percentage must be Boolean',
    }),
    fixedCommission: z.number({
      required_error: 'doctor commision fixed is required',
      invalid_type_error: 'doctor commision fixed must be a number',
    }),
    description: z
      .string({
        required_error: 'Department description is required',
      })
      .optional(),
    isRoomInfo: z
      .boolean({
        required_error: 'Room description is required',
      })
      .optional(),
    roomName: z
      .string({
        required_error: 'Room Name is required',
      })
      .optional(),
    roomNo: z
      .string({
        required_error: 'Room no is required',
      })
      .optional(),
  }),
});

const updateDepartmentZodSchema = z.object({
  body: z.object({
    label: z
      .string({
        required_error: 'department name is required',
      })
      .optional(),
    value: z
      .string({
        required_error: 'department name is required',
      })
      .optional(),
    commissionParcentage: z
      .number({
        required_error: 'doctor commision percentage is required',
        invalid_type_error: 'doctor commision percentage must be a number',
      })
      .optional(),
    isCommissionFiexed: z
      .boolean({
        required_error: 'doctor commision percentage is required',
        invalid_type_error: 'doctor commision percentage must be Boolean',
      })
      .optional(),
    fixedCommission: z
      .number({
        required_error: 'doctor commision fixed is required',
        invalid_type_error: 'doctor commision fixed must be a number',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Department description is required',
      })
      .optional(),
    isRoomInfo: z
      .boolean({
        required_error: 'Room description is required',
      })
      .optional(),
    roomName: z
      .string({
        required_error: 'Room Name is required',
      })
      .optional(),
    roomNo: z.string({
      required_error: 'Room no is required',
    }),
  }),
});

export const departmentValidation = {
  createDepartmentZodSchema,
  updateDepartmentZodSchema,
};
