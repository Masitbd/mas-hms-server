/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage, Types } from 'mongoose';

export const pipelineForOverAllDoctor = (params: { from: Date; to: Date }) => {
  return [
    {
      $match: {
        dueAmount: { $eq: 0 },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
        discountedBy: { $ne: 'free' },
      },
    },
    {
      $lookup: {
        from: 'transations',
        localField: '_id',
        foreignField: 'ref',
        as: 'paymentRef',
      },
    },
    {
      $unwind: { path: '$paymentRef', preserveNullAndEmptyArrays: true },
    },
    {
      $match: {
        'paymentRef.transactionType': 'credit',
      },
    },
    {
      $group: {
        _id: '$_id',
        totalCommission: { $sum: '$paymentRef.amount' },
        totalSell: { $first: '$totalPrice' },
        refBy: { $first: '$refBy' },
      },
    },

    {
      $group: {
        _id: '$refBy',
        sell: { $sum: '$totalSell' },
        exp: { $sum: '$totalCommission' },
      },
    },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
      },
    },

    {
      $unwind: '$doctor',
    },
    {
      $facet: {
        mainDocs: [
          {
            $project: {
              _id: 1,
              sell: 1,
              exp: 1,
              doctor: 1,
            },
          },
        ],
        totalDocs: [
          {
            $group: {
              _id: null,
              sell: { $sum: '$sell' },
              exp: { $sum: '$exp' },
            },
          },
          {
            $project: {
              _id: 1,
              sell: 1,
              exp: 1,
              doctor: { name: 'Total' },
            },
          },
        ],
      },
    },

    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: {
        totalPrice: 1,
      },
    },

    {
      $setWindowFields: {
        sortBy: { sell: 1 }, // or any other field you want to sort by
        output: {
          SL: { $documentNumber: {} },
        },
      },
    },
  ];
};

export const doctorPerformanceSummeryPipeline = (params: {
  from: Date;
  to: Date;
  refBy: string;
}) => {
  return [
    {
      $match: {
        refBy: new Types.ObjectId(params.refBy),
        dueAmount: 0,
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $unwind: {
        path: '$patientData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        name: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: { $ifNull: ['$patientData.name', '$patient.name'] },
            else: '$patient.name',
          },
        },
      },
    },
    {
      $unwind: '$tests',
    },
    {
      $match: {
        'tests.status': { $eq: 'delivered' },
      },
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testData',
      },
    },
    {
      $unwind: {
        path: '$testData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'testData.department',
        foreignField: '_id',
        as: 'departmentData',
      },
    },
    {
      $unwind: {
        path: '$departmentData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$_id',

        name: { $first: '$name' },
        oid: { $first: '$oid' },
        uuid: { $first: '$uuid' },
        departments: {
          $push: {
            departmentName: '$departmentData.label',
            price: '$testData.price',
          },
        },
        testNames: { $addToSet: '$testData.label' },
      },
    },
    {
      $unwind: '$departments',
    },
    {
      $group: {
        _id: {
          orderId: '$_id',
          name: '$name',
          departmentName: '$departments.departmentName',
        },
        totalPrice: { $sum: '$departments.price' },
        testNames: { $first: '$testNames' },
        oid: { $first: '$oid' },
        uuid: { $first: '$uuid' },
      },
    },
    {
      $group: {
        _id: '$_id.orderId',
        name: { $first: '$_id.name' },
        departments: {
          $push: {
            name: '$_id.departmentName',
            price: '$totalPrice',
          },
        },
        testNames: { $first: '$testNames' },
        oid: { $first: '$oid' },
        uuid: { $first: '$uuid' },
      },
    },
    {
      $project: {
        _id: '$_id',
        name: '$name',
        departments: 1,
        testNames: 1,
        oid: 1,
        uuid: 1,
      },
    },
  ];
};

export const doctorOverAllSummeryByRefByPipeline = (params: {
  from: Date;
  to: Date;
  refBy: string;
}) => {
  return [
    {
      $match: {
        refBy: new Types.ObjectId(params.refBy),
        dueAmount: 0,
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: '$tests',
    },
    {
      $match: {
        'tests.status': { $eq: 'delivered' },
      },
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testData',
      },
    },
    {
      $unwind: '$testData',
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'testData.department',
        foreignField: '_id',
        as: 'departmentData',
      },
    },
    {
      $unwind: '$departmentData',
    },

    {
      $addFields: {
        doctorCommission: {
          $cond: {
            if: { $eq: ['$departmentData.isCommissionFiexed', false] },
            then: {
              $divide: [
                {
                  $multiply: [
                    '$testData.price',
                    '$departmentData.commissionParcentage',
                  ],
                },
                100,
              ],
            },
            else: '$departmentData.fixedCommission',
          },
        },
        grossPrice: '$testData.price',
      },
    },
    {
      $addFields: {
        discountAmount: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$tests.discount', 0] },
                { $gt: ['$parcentDiscount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$testData.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$testData.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cdft: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $toInt: {
                $multiply: [
                  { $divide: ['$testData.price', '$totalPrice'] },
                  '$testData.price',
                ],
              },
            },
            else: 0,
          },
        },
      },
    },

    {
      $addFields: {
        discountByDoctor: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$discountedBy', 'doctor'] },
                { $eq: ['$discountedBy', 'both'] },
              ],
            },
            then: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$discountedBy', 'doctor'] },
                    then: '$discountAmount',
                  },
                  {
                    case: { $eq: ['$discountedBy', 'both'] },
                    then: { $divide: ['$discountAmount', 2] },
                  },
                ],
                default: 0,
              },
            },
            else: 0,
          },
        },
      },
    },

    {
      $project: {
        grossPrice: 1,
        departmentData: 1,
        discountedBy: 1,
        parcentDiscount: 1,
        netCommission: {
          $subtract: ['$doctorCommission', '$discountByDoctor'],
        },
        cashDiscount: 1,
        orderPrice: '$totalPrice',
        discountAmount: 1,
        cdft: 1,
        discountByDoctor: 1,
      },
    },
    {
      $group: {
        _id: '$departmentData.label',
        total: { $sum: '$grossPrice' },
        commission: { $sum: '$netCommission' },
        percent: { $first: '$departmentData.commissionParcentage' },
        totalPrice: { $sum: '$grossPrice' },
        discount: { $sum: '$discountByDoctor' },
      },
    },
  ];
};

export const testWiseIncomeStatementPipeline = (params: {
  from: Date;
  to: Date;
}) => {
  return [
    {
      $match: {
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: {
        path: '$tests',
      },
    },

    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: {
        path: '$td',
      },
    },
    {
      $match: {
        'tests.status': { $ne: 'refunded' },
      },
    },
    {
      $addFields: {
        rg: {
          $cond: {
            if: { $eq: [{ $type: '$td.reportGroup' }, 'string'] },
            then: {
              $cond: {
                if: { $eq: [{ $strLenCP: '$td.reportGroup' }, 24] },
                then: { $toObjectId: '$td.reportGroup' },
                else: null,
              },
            },
            else: '$td.reportGroup',
          },
        },
      },
    },

    {
      $lookup: {
        from: 'reportgroups',
        localField: 'rg',
        foreignField: '_id',
        as: 'rgd',
      },
    },
    {
      $unwind: '$rgd',
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  { $divide: ['$cashDiscount', '$totalPrice'] },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },
        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },
    },
    {
      $addFields: {
        netDiscount: {
          $switch: {
            branches: [
              { case: { $eq: ['$discountedBy', 'doctor'] }, then: 0 },
              {
                case: { $eq: ['$discountedBy', 'both'] },
                then: { $divide: [{ $add: ['$cd', '$pd'] }, 2] },
              },
            ],
            default: { $add: ['$cd', '$pd'] },
          },
        },
      },
    },

    {
      $facet: {
        testWiseDocs: [
          {
            $group: {
              _id: '$td.label',
              sell: { $sum: '$td.price' },

              quantity: { $sum: 1 },
              price: { $first: '$td.price' },
              discount: { $sum: '$netDiscount' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
              rg: { $first: '$rgd.label' },
            },
          },
          {
            $sort: { price: -1 },
          },
        ],
        reportGroupWiseData: [
          {
            $group: {
              _id: '$rgd.label',
              sell: { $sum: '$td.price' },

              quantity: { $sum: 1 },
              price: { $first: '$td.price' },
              discount: { $sum: '$netDiscount' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
              rg: { $first: '$rgd.label' },
            },
          },
          {
            $sort: { price: -1 },
          },
        ],

        total: [
          {
            $group: {
              _id: null,
              sell: { $sum: '$td.price' },

              quantity: { $sum: 1 },
              discount: { $sum: '$netDiscount' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
            },
          },
        ],

        tubePrice: [
          {
            $unwind: '$td.testTube',
          },
          {
            $group: {
              _id: '$oid',
              tube: {
                $addToSet: '$td.testTube',
              },
              cashDiscount: { $first: '$cashDiscount' },
              parcentDiscount: { $first: '$parcentDiscount' },
              vat: { $first: '$vat' },
              paid: { $first: '$paid' },
              totalPrice: { $first: '$totalPrice' },
            },
          },
          {
            $unwind: '$tube',
          },
          {
            $lookup: {
              from: 'vacuumtubes',
              localField: 'tube',
              foreignField: '_id',
              as: 'tubeData',
            },
          },
          {
            $unwind: '$tubeData',
          },
          {
            $addFields: {
              va: {
                $cond: {
                  if: { $gt: ['$vat', 0] },
                  then: {
                    $divide: [{ $multiply: ['$tubeData.price', '$vat'] }, 100],
                  },
                  else: 0,
                },
              },
              pa: {
                $cond: {
                  if: { $gt: ['paid', 0] },
                  then: {
                    $floor: {
                      $multiply: [
                        { $divide: ['$paid', '$totalPrice'] },
                        '$tubeData.price',
                      ],
                    },
                  },
                  else: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: '$tubeData.label',
              sell: { $sum: '$tubeData.price' },
              price: { $first: '$tubeData.price' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
              quantity: { $sum: 1 },
            },
          },
        ],
      },
    },
  ];
};

export const departmentWiseIncomeStatement = (params: {
  from: Date;
  to: Date;
}) => {
  return [
    {
      $match: {
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: {
        path: '$tests',
      },
    },

    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: {
        path: '$td',
      },
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },
    {
      $addFields: {
        rg: {
          $cond: {
            if: { $eq: [{ $type: '$td.reportGroup' }, 'string'] },
            then: {
              $cond: {
                if: { $eq: [{ $strLenCP: '$td.reportGroup' }, 24] },
                then: { $toObjectId: '$td.reportGroup' },
                else: null,
              },
            },
            else: '$td.reportGroup',
          },
        },
      },
    },

    {
      $lookup: {
        from: 'reportgroups',
        localField: 'rg',
        foreignField: '_id',
        as: 'rgd',
      },
    },
    {
      $unwind: '$rgd',
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  { $divide: ['$cashDiscount', '$totalPrice'] },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },

        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'td.department',
        foreignField: '_id',
        as: 'dd',
      },
    },
    {
      $unwind: '$dd',
    },
    {
      $addFields: {
        netDiscount: {
          $switch: {
            branches: [
              { case: { $eq: ['$discountedBy', 'doctor'] }, then: 0 },
              {
                case: { $eq: ['$discountedBy', 'both'] },
                then: { $divide: [{ $add: ['$cd', '$pd'] }, 2] },
              },
            ],
            default: { $add: ['$cd', '$pd'] },
          },
        },
      },
    },

    {
      $facet: {
        deptWiseDocs: [
          {
            $group: {
              _id: '$dd.label',
              sell: { $sum: '$td.price' },

              discount: { $sum: '$netDiscount' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
              quantity: { $sum: 1 },
            },
          },
          {
            $sort: { price: -1 },
          },
        ],
        total: [
          {
            $group: {
              _id: null,
              sell: { $sum: '$td.price' },

              discount: { $sum: '$netDiscount' },
              vat: { $sum: '$va' },
              pa: { $sum: '$pa' },
              quantity: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 'Total',
              sell: 1,
              discount: 1,
              vat: 1,
              pa: 1,
              quantity: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$deptWiseDocs', '$total'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
  ];
};

export const departmentWiseCollectionSummeryPipeline = (params: {
  from: Date;
  to: Date;
}) => {
  return [
    {
      $match: {
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: '$tests',
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: '$td',
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },
    {
      $addFields: {
        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'td.department',
        foreignField: '_id',
        as: 'dd',
      },
    },
    {
      $unwind: '$dd',
    },
    {
      $addFields: {
        vp: {
          $ceil: {
            $multiply: [{ $divide: ['$vat', 100] }, '$pa'],
          },
        },
      },
    },
    {
      $addFields: {
        wv: {
          $ceil: {
            $subtract: ['$pa', '$vp'],
          },
        },
      },
    },
    {
      $group: {
        _id: '$dd.label',
        paid: { $sum: '$wv' },
        vat: { $sum: '$vp' },
        totalPaid: { $sum: '$pa' },
      },
    },
    {
      $facet: {
        mainDocs: [
          {
            $project: {
              _id: 1,
              paid: 1,
              vat: 1,
              totalPaid: 1,
            },
          },
        ],
        totalDocs: [
          {
            $group: {
              _id: null,
              paid: { $sum: '$paid' },
              vat: { $sum: '$vat' },
              totalPaid: { $sum: '$totalPaid' },
            },
          },
          {
            $project: {
              _id: 'Total',
              vat: 1,
              totalPaid: 1,
              paid: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: { totalPaid: 1 },
    },
  ];
};

export const doctorPerformanceSummeryDeptWisePipeline = (params: {
  from: Date;
  to: Date;
  refBy: string;
}): PipelineStage[] => {
  return [
    {
      $match: {
        refBy: new Types.ObjectId(params.refBy),
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: {
        path: '$tests',
      },
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: {
        path: '$td',
      },
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      '$cashDiscount',
                      {
                        $subtract: [
                          '$totalPrice',
                          { $ifNull: ['$tubePrice', 0] },
                        ],
                      },
                    ],
                  },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },

        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        netDiscount: {
          $switch: {
            branches: [
              { case: { $eq: ['$discountedBy', 'doctor'] }, then: 0 },
              {
                case: { $eq: ['$discountedBy', 'both'] },
                then: { $divide: [{ $add: ['$cd', '$pd'] }, 2] },
              },
            ],
            default: { $add: ['$cd', '$pd'] },
          },
        },
      },
    },

    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },

        totalDiscount: {
          $add: ['$pd', '$cd'],
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'td.department',
        foreignField: '_id',
        as: 'dd',
      },
    },
    {
      $unwind: '$dd',
    },
    {
      $facet: {
        mainDocs: [
          {
            $group: {
              _id: '$dd.label',

              totalPrice: { $sum: '$td.price' },
              quantity: { $sum: 1 },
              vat: { $sum: '$va' },
              cashDiscount: { $sum: '$cd' },
              parcentDiscount: { $sum: '$pd' },
              paid: { $sum: '$pa' },
              totalDiscount: { $sum: '$totalDiscount' },
            },
          },
          {
            $addFields: {
              price: { $ceil: { $divide: ['$totalPrice', '$quantity'] } },
            },
          },
        ],
        totalDocs: [
          {
            $group: {
              _id: null,

              totalPrice: { $sum: '$td.price' },
              quantity: { $sum: 1 },
              vat: { $sum: '$va' },
              cashDiscount: { $sum: '$cd' },
              parcentDiscount: { $sum: '$pd' },
              paid: { $sum: '$pa' },
              totalDiscount: { $sum: '$totalDiscount' },
            },
          },
          {
            $project: {
              _id: 'Total',

              totalPrice: 1,
              quantity: 1,
              vat: 1,
              cashDiscount: 1,
              parcentDiscount: 1,
              paid: 1,
              totalDiscount: 1,
              price: { $ceil: { $divide: ['$totalPrice', '$quantity'] } },
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: {
        totalPrice: 1,
      },
    },
  ];
};

export const doctorPerformanceSummeryTestWisePipeline = (params: {
  from: Date;
  to: Date;
  refBy: string;
}): PipelineStage[] => {
  return [
    {
      $match: {
        refBy: new Types.ObjectId(params.refBy),
        discountedBy: { $ne: 'free' },
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $unwind: {
        path: '$tests',
      },
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: {
        path: '$td',
      },
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      '$cashDiscount',
                      {
                        $subtract: [
                          '$totalPrice',
                          { $ifNull: ['$tubePrice', 0] },
                        ],
                      },
                    ],
                  },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },

        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        netDiscount: {
          $switch: {
            branches: [
              { case: { $eq: ['$discountedBy', 'doctor'] }, then: 0 },
              {
                case: { $eq: ['$discountedBy', 'both'] },
                then: { $divide: [{ $add: ['$cd', '$pd'] }, 2] },
              },
            ],
            default: { $add: ['$cd', '$pd'] },
          },
        },
      },
    },

    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },

        totalDiscount: {
          $add: ['$pd', '$cd'],
        },
      },
    },

    {
      $facet: {
        mainDocs: [
          {
            $group: {
              _id: '$td.label',

              totalPrice: { $sum: '$td.price' },
              quantity: { $sum: 1 },
              price: { $first: '$td.price' },
              vat: { $sum: '$va' },
              cashDiscount: { $sum: '$cd' },
              parcentDiscount: { $sum: '$pd' },
              paid: { $sum: '$pa' },
              totalDiscount: { $sum: '$totalDiscount' },
            },
          },
        ],
        totalDocs: [
          {
            $group: {
              _id: null,

              totalPrice: { $sum: '$td.price' },
              quantity: { $sum: 1 },
              vat: { $sum: '$va' },
              cashDiscount: { $sum: '$cd' },
              parcentDiscount: { $sum: '$pd' },
              paid: { $sum: '$pa' },
              totalDiscount: { $sum: '$totalDiscount' },
            },
          },
          {
            $project: {
              _id: 'Total',

              totalPrice: 1,
              quantity: 1,
              vat: 1,
              cashDiscount: 1,
              parcentDiscount: 1,
              paid: 1,
              totalDiscount: 1,
              price: { $ceil: { $divide: ['$totalPrice', '$quantity'] } },
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: {
        totalPrice: 1,
      },
    },
  ];
};

export const clientWiseIncomeStatementPipeline = (
  params: Record<string, any>
): PipelineStage[] => {
  const from = params.from ? new Date(params.from) : new Date();
  const toDate = params.to ? new Date(params.to) : new Date();
  // from.setHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);
  return [
    {
      $match: {
        discountedBy: { $ne: 'free' },
        createdAt: {
          $gte: from,
          $lte: toDate,
        },
      },
    },
    {
      $unwind: '$tests',
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: '$td',
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },

    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $unwind: { path: '$patientData', preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        patient: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: '$patientData',
            else: '$patient',
          },
        },
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      '$cashDiscount',
                      {
                        $subtract: [
                          '$totalPrice',
                          { $ifNull: ['$tubePrice', 0] },
                        ],
                      },
                    ],
                  },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalDiscount: {
          $add: ['$pd', '$cd'],
        },
      },
    },
    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
        vatOnTube: {
          $cond: {
            if: { $gt: ['$tubePrice', 0] },
            then: {
              $multiply: [{ $divide: ['$vat', 100] }, '$tubePrice'],
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalVat: { $add: ['$vatOnTube', '$va'] },
      },
    },

    {
      $group: {
        _id: '$oid',
        totalPrice: { $first: '$totalPrice' },
        totalDiscount: { $first: '$totalDiscount' },
        vat: { $sum: '$totalVat' },
        patient: { $first: '$patient' },
        createdAt: { $first: '$createdAt' },
        paid: { $first: '$paid' },
        dueAmount: { $first: '$dueAmount' },
      },
    },
    {
      $facet: {
        mainDocs: [
          {
            $project: {
              _id: 1,
              totalPrice: 1,
              totalDiscount: 1,
              vat: 1,
              paid: 1,
              dueAmount: 1,
              patient: {
                name: 1,
                _id: 1,
              },
              createdAt: 1,
            },
          },
        ],
        nameWiseTotalDocs: [
          {
            $group: {
              _id: '$patient.name',
              totalPrice: { $sum: '$totalPrice' },
              totalDiscount: { $sum: '$totalDiscount' },
              vat: { $sum: '$vat' },
              quantity: { $sum: 1 },
              paid: { $sum: '$paid' },
              dueAmount: { $sum: '$dueAmount' },
            },
          },
        ],

        grandTotalDocs: [
          {
            $group: {
              _id: null,
              totalPrice: { $sum: '$totalPrice' },
              totalDiscount: { $sum: '$totalDiscount' },
              vat: { $sum: '$vat' },
              quantity: { $sum: 1 },
              paid: { $sum: '$paid' },
              dueAmount: { $sum: '$dueAmount' },
            },
          },
        ],
      },
    },
  ];
};

export const refByWiseIncomeStatementPipeline = (
  params: Record<string, any>
): PipelineStage[] => {
  const from = params.from ? new Date(params.from) : new Date();
  const toDate = params.to ? new Date(params.to) : new Date();
  // from.setHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);
  return [
    {
      $match: {
        refBy: { $ne: null },
        discountedBy: { $ne: 'free' },
        createdAt: {
          $gte: from,
          $lte: toDate,
        },
      },
    },
    {
      $unwind: '$tests',
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: '$td',
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },

    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $unwind: { path: '$patientData', preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        patient: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: '$patientData',
            else: '$patient',
          },
        },
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      '$cashDiscount',
                      {
                        $subtract: [
                          '$totalPrice',
                          { $ifNull: ['$tubePrice', 0] },
                        ],
                      },
                    ],
                  },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalDiscount: {
          $add: ['$pd', '$cd'],
        },
      },
    },
    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
        vatOnTube: {
          $cond: {
            if: { $gt: ['$tubePrice', 0] },
            then: {
              $multiply: [{ $divide: ['$vat', 100] }, '$tubePrice'],
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalVat: { $add: ['$vatOnTube', '$va'] },
      },
    },

    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refBy',
      },
    },
    {
      $unwind: '$refBy',
    },
    {
      $group: {
        _id: '$oid',
        totalPrice: { $first: '$totalPrice' },
        totalDiscount: { $first: '$totalDiscount' },
        vat: { $sum: '$totalVat' },
        refBy: { $first: '$refBy' },
        createdAt: { $first: '$createdAt' },
        paid: { $first: '$paid' },
        dueAmount: { $first: '$dueAmount' },
      },
    },
    {
      $facet: {
        mainDocs: [
          {
            $project: {
              totalPrice: 1,
              totalDiscount: 1,
              vat: 1,
              paid: 1,
              dueAmount: 1,
              refBy: {
                name: 1,
                _id: 1,
                title: 1,
              },
              createdAt: 1,
            },
          },
        ],
        refByWiseTotalDocs: [
          {
            $group: {
              _id: '$refBy._id',
              totalPrice: { $sum: '$totalPrice' },
              totalDiscount: { $sum: '$totalDiscount' },
              vat: { $sum: '$vat' },
              quantity: { $sum: 1 },
              paid: { $sum: '$paid' },
              dueAmount: { $sum: '$dueAmount' },
              refBy: { $first: '$refBy' },
            },
          },
          {
            $project: {
              _id: 1,
              totalPrice: 1,
              totalDiscount: 1,
              vat: 1,
              quantity: 1,
              refBy: {
                _id: 1,
                name: 1,
                title: 1,
              },
            },
          },
        ],

        grandTotalDocs: [
          {
            $group: {
              _id: null,
              totalPrice: { $sum: '$totalPrice' },
              totalDiscount: { $sum: '$totalDiscount' },
              vat: { $sum: '$vat' },
              paid: { $sum: '$paid' },
              dueAmount: { $sum: '$dueAmount' },
              quantity: { $sum: 1 },
            },
          },
        ],
      },
    },
  ];
};

export const dewCollectionSummeryPipeline = (params: {
  from: Date;
  to: Date;
}): PipelineStage[] => {
  return [
    {
      $match: {
        postedBy: { $ne: null },
        description: 'Collected due amount',
        createdAt: {
          $lte: new Date(params.to),
          $gte: new Date(params.from),
        },
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: 'postedBy',
        foreignField: 'uuid',
        as: 'postedBy',
      },
    },
    {
      $unwind: '$postedBy',
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'ref',
        foreignField: '_id',
        as: 'orderData',
      },
    },
    {
      $unwind: '$orderData',
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'orderData.uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: { $eq: ['$orderData.patientType', 'registered'] },
            then: '$patientData',
            else: ['$orderData.patient'],
          },
        },
      },
    },
    {
      $unwind: '$pd',
    },
    {
      $addFields: {
        patient: '$pd.name',
        oid: '$orderData.oid',
      },
    },

    {
      $facet: {
        mainDocs: [
          {
            $project: {
              createdAt: 1,
              oid: 1,
              patient: 1,
              user: '$postedBy.name',
              amount: 1,
            },
          },
        ],

        totalDocs: [
          {
            $group: { _id: null, amount: { $sum: '$amount' } },
          },
          {
            $project: {
              amount: 1,
              createdAt: '$$NOW',
              patient: 'Total',
              user: 'Total',
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ];
};

export const newBillSummeryPipeline = (
  params: Record<string, any>
): PipelineStage[] => {
  const from = params.from ? new Date(params.from) : new Date();
  const toDate = params.to ? new Date(params.to) : new Date();
  // from.setHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);

  return [
    {
      $match: {
        postedBy: { $ne: null },
        createdAt: {
          $gte: from,
          $lte: toDate,
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: 'postedBy',
        foreignField: 'uuid',
        as: 'postedBy',
      },
    },
    {
      $unwind: '$postedBy',
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: '$patientData',
            else: ['$patient'],
          },
        },
      },
    },
    {
      $unwind: '$pd',
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $addFields: {
        patient: '$pd.name',
      },
    },
    {
      $facet: {
        mainDocs: [
          {
            $project: {
              createdAt: 1,
              oid: 1,
              patient: 1,
              user: '$postedBy.name',
              amount: '$totalPrice',
            },
          },
        ],
        totalDocs: [
          {
            $group: { _id: null, amount: { $sum: '$totalPrice' } },
          },
          {
            $project: {
              amount: 1,
              patient: 'Total',
              createdAt: '$$NOW',
              user: 'Total',
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $concatArrays: ['$mainDocs', '$totalDocs'],
        },
      },
    },
    {
      $unwind: '$combined',
    },
    {
      $replaceRoot: { newRoot: '$combined' },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ];
};

export const employeePerfromanceSummeryPipeline = (
  params: Record<string, any>
): PipelineStage[] => {
  const from = params.from ? new Date(params.from) : new Date();
  const toDate = params.to ? new Date(params.to) : new Date();
  // from.setHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);
  return [
    {
      $match: {
        refBy: {
          $ne: null,
        },
        createdAt: {
          $gte: from,
          $lte: toDate,
        },
      },
    },
    {
      $unwind: '$refBy',
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refBy',
      },
    },
    {
      $unwind: '$refBy',
    },
    {
      $match: {
        'refBy.assignedME': { $ne: null },
      },
    },
    {
      $lookup: {
        from: 'employeeregistrations',
        localField: 'refBy.assignedME',
        foreignField: '_id',
        as: 'marketingExecutive',
      },
    },
    {
      $unwind: '$marketingExecutive',
    },
    {
      $unwind: '$tests',
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'td',
      },
    },
    {
      $unwind: {
        path: '$td',
      },
    },
    {
      $match: {
        $and: [
          {
            'tests.status': { $ne: 'refunded' },
          },
          { 'tests.status': { $ne: 'free' } },
        ],
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: ['$parcentDiscount', 0] },
                { $gt: ['$tests.discount', 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: ['$tests.discount', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$td.price', '$tests.discount'] },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: { $gt: ['$parcentDiscount', 0] },
                    then: {
                      $divide: [
                        { $multiply: ['$td.price', '$parcentDiscount'] },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            else: 0,
          },
        },
        cd: {
          $cond: {
            if: { $gt: ['$cashDiscount', 0] },
            then: {
              $floor: {
                $multiply: [
                  {
                    $divide: [
                      '$cashDiscount',
                      {
                        $subtract: [
                          '$totalPrice',
                          { $ifNull: ['$tubePrice', 0] },
                        ],
                      },
                    ],
                  },
                  '$td.price',
                ],
              },
            },
            else: 0,
          },
        },

        pa: {
          $cond: {
            if: { $gt: ['paid', 0] },
            then: {
              $floor: {
                $multiply: [{ $divide: ['$paid', '$totalPrice'] }, '$td.price'],
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalDiscount: {
          $add: ['$pd', '$cd'],
        },
      },
    },
    {
      $addFields: {
        va: {
          $ceil: {
            $cond: {
              if: { $gt: ['$vat', 0] },
              then: {
                $divide: [
                  {
                    $multiply: [
                      { $subtract: ['$td.price', { $add: ['$pd', '$cd'] }] },
                      '$vat',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },

        vatOnTube: {
          $cond: {
            if: { $gt: ['$tubePrice', 0] },
            then: {
              $multiply: [{ $divide: ['$vat', 100] }, '$tubePrice'],
            },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        totalVat: { $add: ['$vatOnTube', '$va'] },
      },
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientData',
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: '$patientData',
            else: ['$patient'],
          },
        },
      },
    },
    {
      $unwind: '$pd',
    },

    {
      $addFields: {
        patient: '$pd.name',
        marketingExecutive: '$marketingExecutive.name',
        doctor: '$refBy.name',
      },
    },
    {
      $group: {
        _id: '$oid',
        totalPrice: { $first: '$totalPrice' },
        totalDiscount: { $sum: '$totalDiscount' },
        paid: { $first: '$paid' },
        doctor: { $first: '$doctor' },
        patient: { $first: '$patient' },
        marketingExecutive: { $first: '$marketingExecutive' },
        createdAt: { $first: '$createdAt' },
        oid: { $first: '$oid' },
        vat: { $sum: '$va' },
        vatOnTube: { $first: '$vatOnTube' },
        MEId: { $first: '$refBy.assignedME' }, //ME = Marketing executive
      },
    },
    params?.id
      ? {
          $match: {
            MEId: { $eq: new Types.ObjectId(params?.id) },
          },
        }
      : {
          $match: {
            MEId: { $ne: null },
          },
        },
    {
      $addFields: {
        totalVat: {
          $add: ['$vat', '$vatOnTube'],
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $facet: {
        mainDocs: [
          {
            $project: {
              totalPrice: 1,
              totalDiscount: 1,
              paid: 1,
              doctor: 1,
              patient: 1,
              marketingExecutive: 1,
              createdAt: 1,
              oid: 1,
              MEId: 1,
              totalVat: 1,
            },
          },
        ],
        totalDocs: [
          {
            $group: {
              _id: null,
              totalPrice: { $sum: '$totalPrice' },
              totalDiscount: { $sum: '$totalDiscount' },
              paid: { $sum: '$paid' },
              totalVat: { $sum: '$totalVat' },
              patient: { $sum: 1 },
            },
          },
          {
            $addFields: {
              oid: 'Total',
              marketingExecutive: 'Total',
            },
          },
        ],
      },
    },
  ];
};
