import { z } from 'zod';

const DoctorValidator = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    fatherName: z
      .string({
        required_error: 'Father Name is required',
      })
      .optional(),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .optional(),
    designation: z.string({
      required_error: 'Designation is required',
    }),
    phone: z
      .string({
        required_error: 'Phone Number is required',
      })
      .optional(),
    code: z
      .string({
        required_error: 'Code  is required',
      })
      .optional(),
    image: z
      .string({
        required_error: 'image is required',
      })
      .optional(),
    address: z
      .string({
        required_error: 'Address is required',
      })
      .optional(),
    assignedME: z
      .string({
        required_error: 'Marketing executinve is required',
      })
      .optional(),
  }),
});
const DoctorValidatorForUpdate = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    fatherName: z
      .string({
        required_error: 'Father name is required',
      })
      .optional(),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .optional(),
    designation: z
      .string({
        required_error: 'Designation is required',
      })
      .optional(),
    phone: z
      .string({
        required_error: 'Phone Number is required',
      })
      .optional(),
    image: z
      .string({
        required_error: 'image is required',
      })
      .optional(),
    address: z
      .string({
        required_error: 'Address is required',
      })
      .optional(),
    assignedME: z
      .string({
        required_error: 'Marketing executinve is required',
      })
      .optional(),
  }),
});

export const DoctorValidation = {
  DoctorValidator,
  DoctorValidatorForUpdate,
};
