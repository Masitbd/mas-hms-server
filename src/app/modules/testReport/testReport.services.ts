import fs from 'fs';
// import { ISpecimen } from './specimen.interfaces';
// import { Specimen } from './specimen.model';

import httpStatus from 'http-status';
import { Types } from 'mongoose';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import GeneratePdf from '../../../utils/PdfGenerator';
import { IBacteria } from '../bacteria/bacteria.interface';
import { Bacteria } from '../bacteria/bacteria.model';
import { Condition } from '../condition/condition.model';
import { IDepartment } from '../departments/departments.interfaces';
import { IDoctor } from '../doctor/doctor.interface';
import { Order } from '../order/order.model';
import { Patient } from '../patient/patient.model';
import { ISpecimen } from '../specimen/specimen.interfaces';
import { Test } from '../test/test.model';
import {
  IDescriptive,
  IDescriptiveDataDocs,
  IMicrobiologyBacteria,
  IParameterBased,
  ITestReport,
} from './testReport.interfaces';
import { TestReport } from './testReport.model';

type IResultFields = {
  title: string;
  test: string;
  unit: string;
  normalValue: string;
  defaultValue: Types.ObjectId[];
  resultDescripton: string;
  hasPdrv?: boolean;
  sensitivityOptions: [];
  conditions: Types.ObjectId[];
  bacteria: Types.ObjectId[];
  duration: string;
  temperatures: string;
  growth: boolean;
  colonyCount?: {
    thenType: string;
    powerType: string;
  };
  _id: string;
};

type finalDataForSendBakcend = {
  testId: string;
  orderId: string;
  result?: string;
  comment?: string;
  resultDescripton?: string;
  type: string;
  docsData?: string;
  data?: IResultFields;
};

// // For posting new specimen information
const createTestReport = async (
  payload: finalDataForSendBakcend
): Promise<void | ITestReport> => {
  const parameterBasedObject: Partial<IParameterBased> = {
    _id: payload.data?._id,
    title: payload.data?.title,
    test: payload.data?.test,
    hasPdrv: payload.data?.hasPdrv,
    unit: payload.data?.unit,
    normalValue: payload.data?.normalValue,
    result: payload.result || '',
    comment: payload.comment || '',
  };

  const descriptive: Partial<IDescriptive> = {
    _id: payload.data?._id,
    title: payload.data?.title,
    resultDescripton: payload.resultDescripton,
  };
  const descriptiveObject: Partial<IDescriptiveDataDocs> = {
    docsContent: payload.docsData || '',
    descriptive: [descriptive] as IDescriptive[],
  };
  console.log('docs', descriptiveObject);
  const microbiologybacterialObject: Partial<IMicrobiologyBacteria> = {
    _id: payload.data?._id,
    bacterias: payload.data?.bacteria,
    conditions: payload.data?.conditions,
    sensitivityOptions: payload?.data?.sensitivityOptions,
    colonyCount: payload.data?.colonyCount,
    duration: payload.data?.duration,
    growth: payload.data?.growth,
    temperatures: payload.data?.temperatures,
  };

  const data = {
    testId: payload.testId,
    orderId: payload.orderId,
    parameterBased: payload.type === 'parameter' ? [parameterBasedObject] : [],
    descriptive: payload.type === 'descriptive' ? descriptiveObject : {},
    microbiology:
      payload.type === 'bacterial' ? [microbiologybacterialObject] : [],
  };
  // console.log(microbiologybacterialObject);

  // console.log(data);

  if (payload.type === 'parameter') {
    // console.log('p', data);
    const isExist = await TestReport.findOne({ testId: data.testId });
    if (!isExist) {
      // console.log(data);
      const newTestReport = new TestReport(data);
      await newTestReport.save();
      // console.log('finaldatatosend', newTestReport);
    }

    const isExistForValue = await TestReport.findOne({
      parameterBased: { $elemMatch: { _id: parameterBasedObject._id } },
    });
    if (!isExistForValue) {
      await TestReport.updateOne(
        { testId: data.testId },
        { $push: { parameterBased: parameterBasedObject } }
      );
      // console.log('80');
    } else {
      // console.log(isExistForValue, '81');
      const updateFields: { [key: string]: string | undefined } = {};

      if (parameterBasedObject.result) {
        updateFields['parameterBased.$.result'] = parameterBasedObject.result;
      } else {
        updateFields['parameterBased.$.comment'] = parameterBasedObject.comment;
      }

      await TestReport.updateOne(
        {
          testId: data.testId,
          'parameterBased._id': parameterBasedObject._id,
        },
        {
          $set: updateFields,
        }
      );
    }
  } else if (payload.type === 'descriptive') {
    console.log('payload', payload);
    const isExist = await TestReport.findOne({ testId: data.testId });
    if (!isExist) {
      const newTestReport = new TestReport(data);
      await newTestReport.save();
      // console.log('finaldatatosend', newTestReport);
    }
    if (payload.docsData) {
      if (isExist?.descriptiveDataDocs?.docsContent === '') {
        await TestReport.updateOne(
          { testId: data.testId },
          {
            $set: {
              'descriptiveDataDocs.docsContent': descriptiveObject.docsContent,
            },
          }
        );
      } else {
        await TestReport.updateOne(
          { testId: data.testId },
          {
            $set: {
              'descriptiveDataDocs.docsContent': descriptiveObject.docsContent,
            },
          }
        );
      }
    } else {
      console.log('liver');
      const isExistForValue = await TestReport.findOne({
        'descriptiveDataDocs.descriptive': {
          $elemMatch: { _id: descriptive._id },
        },
      });
      console.log('182', isExistForValue);
      if (!isExistForValue) {
        await TestReport.updateOne(
          { testId: data.testId },
          { $push: { 'descriptiveDataDocs.descriptive': descriptive } }
        );
      } else {
        console.log(isExistForValue, '81');
        const updateFields: { [key: string]: string } = {};
        if (descriptive.resultDescripton) {
          updateFields['descriptiveDataDocs.descriptive.$.resultDescripton'] =
            descriptive.resultDescripton;
          await TestReport.updateOne(
            {
              testId: data.testId,
              'descriptiveDataDocs.descriptive._id': descriptive._id,
            },
            {
              $set: updateFields,
            }
          );
        }
      }
    }
  } else {
    const microbiologybacterialObject: Partial<IMicrobiologyBacteria> = {
      _id: payload.data?._id,
      conditions: payload.data?.conditions,
      duration: payload.data?.duration,
      temperatures: payload.data?.temperatures,
      growth: payload.data?.growth,
      colonyCount: payload.data?.colonyCount,
      bacterias: payload.data?.bacteria,
      sensitivityOptions: payload?.data?.sensitivityOptions,
    };
    const isExist = await TestReport.findOne({ testId: data.testId });
    if (!isExist) {
      const newTestReport = new TestReport(data);
      await newTestReport.save();
      // console.log('finaldatatosend', newTestReport);
    }
    await TestReport.updateOne(
      {
        testId: data.testId,
        'microbiology._id': microbiologybacterialObject._id,
      },
      {
        $set: {
          'microbiology.$': microbiologybacterialObject,
        },
      }
    );
    // const ifDonethis = await TestReport.findOne({
    //   testId: data.testId,
    //   'microbiology._id': microbiologybacterialObject._id,
    // });
    // console.log('test', ifDonethis);

    // console.log('ifDOne', ifDone);
    // console.log('idf', microbiologybacterialObject);
  }

  //status change
  const order = await Order.findById(data.orderId);
  const index = order?.tests.findIndex(
    test => test.test.toString() === data.testId
  );

  if (order && order.tests[index as number]) {
    order.tests[index as number].status = 'completed';
  }
  await order?.save();
};

// This function works for getting  a single specimen
const getSingleTestReport = async (id: string) => {
  const result = await TestReport.findOne({ testId: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'test report not found');
  }
  return result;
};
const getSingleTestReportPrint = async (id: string) => {
  const result = await TestReport.findOne({ testId: id });
  const condition = await Condition.findOne({
    _id: result?.microbiology?.[0]?.conditions[0],
  });
  let bacteria: IBacteria | null = null;
  const bacteriaId = result?.microbiology?.[0]?.bacterias?.[0];
  if (bacteriaId !== undefined) {
    const bacteriass = await Bacteria.findOne({
      _id: bacteriaId,
    });
    bacteria = bacteriass;
  }

  const order = await Order.findOne({ _id: result?.orderId }).populate('refBy');
  const patient = await Patient.findOne({ uuid: order?.uuid });
  const test = await Test.findOne({ _id: result?.testId })
    .populate({ path: 'department' })
    .populate('specimen')
    .populate('groupTests')
    .populate('testTube')
    .populate('hospitalGroup')
    .populate('groupTests');

  const data = {
    id: order?.uuid,
    receivingDate: Date.now(),
    patientName: patient?.name,
    age: patient?.age,
    sex: patient?.gender,
    referredBy: (order?.refBy as unknown as IDoctor)?.name,
    specimen: (test?.specimen as unknown as ISpecimen[])[0]?.label,
    department: (test?.department as unknown as IDepartment)?.label,
    parameterBased: result?.parameterBased?.map(item => ({
      test: item.test,
      result: item.result,
      normalValue: item.normalValue !== '0' ? item.normalValue : false,
    })),
  };
  // console.log('order', order);
  console.log('test', test?.testResultType);

  const microbiologyData = {
    id: order?.uuid,
    receivingDate: Date.now(),
    patientName: patient?.name,
    age: patient?.age,
    sex: patient?.gender,
    referredBy: (order?.refBy as unknown as IDoctor)?.name,
    specimen: (test?.specimen as unknown as ISpecimen[])[0]?.label,
    department: (test?.department as unknown as IDepartment)?.label,
    colonyCountP: result?.microbiology?.[0]?.colonyCount?.powerType,
    colonyCountT: result?.microbiology?.[0]?.colonyCount?.thenType,
    growth: result?.microbiology?.[0]?.growth,
    temperatures: result?.microbiology?.[0]?.temperatures,
    time: result?.microbiology?.[0]?.duration,
    sensitivity: result?.microbiology?.[0]?.sensitivityOptions?.map(
      (item: { name: string; A: string; B: string; C: string }) => ({
        name: item.name,
        A: item.A,
        B: item.B,
        C: item.C,
      })
    ),
    condition: condition?.value,
    bacterias: bacteria?.value,
  };

  const descriptiveData = {
    id: order?.uuid,
    receivingDate: Date.now(),
    patientName: patient?.name,
    age: patient?.age,
    sex: patient?.gender,
    referredBy: (order?.refBy as unknown as IDoctor)?.name,
    specimen: (test?.specimen as unknown as ISpecimen[])[0]?.label,
    department: (test?.department as unknown as IDepartment)?.label,
    newHTML: result?.descriptiveDataDocs?.docsContent,
  };

  console.log(descriptiveData);

  const template =
    test?.testResultType === 'parameter'
      ? './Template/parameterBased.html'
      : test?.testResultType === 'descriptive'
      ? './Template/descriptive.html'
      : './Template/Bacterial.html';
  const templateHtml = fs.readFileSync(
    path.resolve(__dirname, template),
    'utf8'
  );
  console.log(templateHtml);

  const bufferResult = await GeneratePdf({
    data:
      test?.testResultType === 'parameter'
        ? data
        : test?.testResultType === 'descriptive'
        ? descriptiveData
        : microbiologyData,
    templateHtml: templateHtml,
    options: {
      format: 'A4',
      printBackground: true,
      // margin: {
      //   left: '0px',
      //   top: '0px',
      //   right: '0px',
      //   bottom: '0px',
      // },
    },
  });
  // console.log(bufferResult);
  return bufferResult;
};

// This function works for finding all the specimen
const getAllTestReport = async (): Promise<ITestReport[] | null> => {
  const result = await TestReport.find();
  return result;
};

// This function work for deleting a single specimen
const deleteTestReport = async (id: string) => {
  const result = await TestReport.findOneAndDelete({ _id: id });

  return result;
};

export const TestReportService = {
  createTestReport,
  getAllTestReport,
  getSingleTestReport,

  deleteTestReport,
  getSingleTestReportPrint,
};
