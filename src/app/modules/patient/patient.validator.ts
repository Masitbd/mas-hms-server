import { z } from 'zod';

const PatientValidator = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    age: z.string({
      required_error: 'Name is required',
    }),
    gender: z.string({
      required_error: 'Name is required',
    }),
    address: z.string({
      required_error: 'Name is required',
    }),
    ref_by: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    consultant: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    phone: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    image: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
  }),
});

const PatientValidatorForPatch = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    age: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    gender: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    address: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    ref_by: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    consultant: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    phone: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    email: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    image: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
  }),
});
export const PatientValidation = {
  PatientValidator,
  PatientValidatorForPatch,
};
