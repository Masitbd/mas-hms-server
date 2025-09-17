// margin.model.ts
import { InferSchemaType, Schema, model, models } from 'mongoose';

/** TypeScript type */
export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

// Reusable numeric field with coercion
const numeric = {
  type: Number,
  required: true,
  default: 0,
  set: (v: unknown) => Number(v), // "12" -> 12, null/undefined -> NaN (but default handles undefined)
  validate: {
    validator: (v: number) => Number.isFinite(v),
    message: 'Value must be a finite number',
  },
};

/** Mongoose schema */
const MarginSchema = new Schema(
  {
    top: numeric,
    right: numeric,
    bottom: numeric,
    left: numeric,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/** Inferred doc type from schema (preferred in Mongoose v7+) */
export type MarginDoc = InferSchemaType<typeof MarginSchema>;

/** Optional: embeddable subdocument (no _id) if you want to nest inside other docs */
export const MarginSubSchema = new Schema(
  {
    top: numeric,
    right: numeric,
    bottom: numeric,
    left: numeric,
  },
  { _id: false, versionKey: false }
);

/** Mongoose model */
export const MarginModel =
  models.Margin || model<MarginDoc>('Margin', MarginSchema);
