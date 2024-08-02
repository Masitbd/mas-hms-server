import { Model, Types } from 'mongoose';

type IResultFields = {
  investigation: string;
  test: string;
  unit: string;
  normalValue: string;
  defaultValue: Types.ObjectId[];
  resultDescripton: string;
  hasPdrv?: boolean;
  sensitivityOptions: Types.ObjectId[];
  condition: Types.ObjectId[];
  bacteria: Types.ObjectId[];
};

export type ITest = {
  value: string;
  label: string;
  description?: string;
  testResultType: string;
  department: Types.ObjectId;
  testCode?: string;
  specimen: Types.ObjectId;
  type: string;
  hasTestTube: boolean;
  testTube: Types.ObjectId[];
  reportGroup: string;
  hospitalGroup: Types.ObjectId;
  price: number;
  isGroupTest: boolean;
  groupTests: Types.ObjectId[];
  vatRate: number;
  processTime: number;
  resultFields: IResultFields[];
};

export type ItestFiltarableFields =
  | 'searchTerm'
  | 'label'
  | 'department'
  | 'testCode'
  | 'specimen'
  | 'type'
  | 'hospitalGroup'
  | 'price'
  | 'isGroupTest';
export type TestModel = Model<ITest, Record<string, unknown>>;
