import { z } from 'zod';

const testValidator = z.object({
  body: z.object({
    value: z.string({
      required_error: 'Value is required',
    }),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .optional(),
    label: z.string({
      required_error: 'Label is required',
    }),
    testResultType: z.string({
      required_error: 'Test Result Type is required',
    }),
    department: z.string({
      required_error: 'Department is required',
    }),
    type: z.string({
      required_error: 'Label is required',
    }),
    hasTestTube: z.boolean({
      required_error: 'TestTube is required',
    }),
    testTube: z.array(z.string().optional()).optional(),
    reportGroup: z.string({
      required_error: 'Report group is required',
    }),
    hospitalGroup: z.string({
      required_error: 'Label is required',
    }),
    price: z.number({
      required_error: 'Label is required',
    }),
    isGroupTest: z.boolean({
      required_error: 'Group test is required',
    }),
    groupTests: z.array(z.string()).optional(),
    vatRate: z.number({
      required_error: 'Vat rate is required',
    }),
    processTime: z.number({
      required_error: 'Process time is required',
    }),
    resultFields: z
      .array(
        z.object({
          title: z.string({ required_error: 'Title is required' }).optional(),
          test: z
            .string({
              required_error: 'Test is required',
            })
            .optional(),
          unit: z.string().optional(),
          normalValue: z.string().optional(),
          defaultValue: z.array(z.string().optional()).optional(),
          resultDescripton: z.string().optional(),
          sensitivityOptions: z.array(z.string().optional()).optional(),
          condition: z.array(z.string().optional()).optional(),
          bacteria: z.array(z.string().optional()).optional(),
        })
      )
      .optional(),
  }),
});

const testValidatorForPatch = z.object({
  body: z.object({
    value: z
      .string({
        required_error: 'Value is required',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .optional(),
    label: z
      .string({
        required_error: 'Label is required',
      })
      .optional(),
    department: z
      .string({
        required_error: 'Department is required',
      })
      .optional(),
    type: z
      .string({
        required_error: 'Label is required',
      })
      .optional(),
    hasTestTube: z
      .boolean({
        required_error: 'TestTube is required',
      })
      .optional(),
    testTube: z.array(z.string().optional()).optional(),
    reportGroup: z
      .string({
        required_error: 'Report group is required',
      })
      .optional(),
    hospitalGroup: z
      .string({
        required_error: 'Label is required',
      })
      .optional(),
    price: z
      .number({
        required_error: 'Label is required',
      })
      .optional(),
    isGroupTest: z
      .boolean({
        required_error: 'Group test is required',
      })
      .optional(),
    groupTests: z.array(z.string()).optional(),
    vatRate: z
      .number({
        required_error: 'Vat rate is required',
      })
      .optional(),
    processTime: z
      .number({
        required_error: 'Process time is required',
      })
      .optional(),
    resultFields: z.array(
      z.object({
        title: z.string({ required_error: 'Title is required' }).optional(),
        test: z
          .string({
            required_error: 'Test is required',
          })
          .optional(),
        unit: z.string().optional(),
        normalValue: z.string().optional(),
        defaultValue: z.array(z.string().optional()).optional(),
        resultDescripton: z.string().optional(),
        sensitivityOptions: z.array(z.string().optional()).optional(),
        condition: z.array(z.string().optional()).optional(),
        bacteria: z.array(z.string().optional()).optional(),
      })
    ),
  }),
});
export const TestValidtion = { testValidator, testValidatorForPatch };
