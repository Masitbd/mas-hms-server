import { Model, Types } from 'mongoose';

type IResultFields = {
  title: string;
  test: string;
  unit: string;
  normalValue: string;
  defaultValue: Types.ObjectId[];
  resultDescripton: string;
  hasPdrv?: boolean;
  sensitivityOptions: Types.ObjectId[];
  condition: Types.ObjectId[];
  bacteria: Types.ObjectId[];
  label?: string;
  description?: string;
};

export type ITest = {
  _id?: Types.ObjectId;
  value: string;
  label: string;
  description?: string;
  testResultType: string;
  department: Types.ObjectId;
  testCode?: string;
  specimen?: Types.ObjectId;
  type: string;
  hasTestTube: boolean;
  testTube: Types.ObjectId[];
  reportGroup: Types.ObjectId;
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
