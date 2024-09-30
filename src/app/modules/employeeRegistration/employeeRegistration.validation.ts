import { z } from 'zod';

const EmployeeValidator = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Employee name is required',
    }),
    fatherName: z.string({
      required_error: 'Father name is required',
    }),
    gender: z.string({
      required_error: 'Gender select is required',
    }),
    parmanentAddress: z.string({
      required_error: 'Parmanent address is required',
    }),
    phoneNo: z.string({
      required_error: 'Phone number is required',
    }),
    email: z.string({
      required_error: 'Email is required',
    }),
    image: z.string().optional(),
    defaultImage: z.string().optional(),
  }),
});

const EmployeeValidatorForPatch = z.object({
  body: z
    .object({
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

      gender: z
        .string({
          required_error: 'Gender select is required',
        })
        .optional(),
      parmanentAddress: z
        .string({
          required_error: 'Parmanent address is required',
        })
        .optional(),
      phoneNo: z
        .string({
          required_error: 'Phone number is required',
        })
        .optional(),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .optional(),
      image: z.string().optional(),
      defaultImage: z.string().optional(),
    })
    .optional(),
});

export const EmployeeRegistrationValidation = {
  EmployeeValidator,
  EmployeeValidatorForPatch,
};
