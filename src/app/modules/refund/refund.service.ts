/* eslint-disable no-unused-expressions */
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { Order } from '../order/order.model';

import { ENUM_TEST_STATUS } from '../../../enums/testStatusEnum';
import { ITestsFromOrder } from '../order/order.interface';
import { Transation } from '../transaction/transaction.model';
import { VacuumTube } from '../vacuumTube/vacuumTube.models';
import { Refund } from './refund.model';

const post = async (params: {
  oid: string;
  id: string;
  refundedBy: string;
}) => {
  // Start a Mongoose session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doesOrderExist = await Order.findOne({ oid: params.oid })
      .populate('tests.test')
      .session(session); // Use session for queries

    if (!doesOrderExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order Not Found');
    }

    const order = doesOrderExist;
    const refundedTest = order.tests.find(
      t => t.SL == Number(params.id)
    ) as ITestsFromOrder;

    if (!refundedTest) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid test Id');
    }

    const refundedTestIndex = order.tests.indexOf(refundedTest);
    let refundedTestPrice = 0;
    if ('price' in refundedTest.test)
      refundedTestPrice = refundedTest?.test?.price;
    const gruntedDiscount = Number(refundedTest.discount);
    const parcentDiscount = order.parcentDiscount;
    const vat = Number(order.vat);
    let refundApplied = 0;
    let remainingRefund = 0;
    let netPriceOfTest = Number(refundedTestPrice);
    let DiscountAmount = 0;
    let vatAmount = 0;
    const tubePrice = order?.tubePrice || 0;
    const cashDiscount = order.cashDiscount;
    const totalPrice = order.totalPrice;

    //For tubes
    const tubesBeforeRefund = new Set<string>();
    order.tests.length &&
      order.tests.map((test: ITestsFromOrder) => {
        if ('testTube' in test.test && test.status !== 'refunded') {
          if (test.test?.hasTestTube) {
            test.test.testTube.forEach(tube =>
              tubesBeforeRefund.add(tube.toString())
            );
          }
        }
      });

    // Calculate discount
    if (gruntedDiscount > 0) {
      DiscountAmount = Math.ceil((netPriceOfTest * gruntedDiscount) / 100);
      netPriceOfTest -= DiscountAmount;
    }

    if (parcentDiscount > 0 && gruntedDiscount == 0) {
      DiscountAmount = Math.ceil((netPriceOfTest * parcentDiscount) / 100);
      netPriceOfTest -= DiscountAmount;
    }
    if (gruntedDiscount == 0 && cashDiscount) {
      const cashDiscountOnTest = Math.ceil(
        (cashDiscount / (totalPrice - tubePrice)) * refundedTestPrice
      );
      DiscountAmount += cashDiscountOnTest;
      netPriceOfTest -= cashDiscountOnTest;
    }

    if (vat) {
      const VatAmount = (netPriceOfTest * vat) / 100;
      vatAmount += VatAmount;
      netPriceOfTest += VatAmount;
    }

    // Update order
    refundedTest.status = ENUM_TEST_STATUS.REFUNDED;
    let dueAmount = order.dueAmount;
    order.tests.splice(refundedTestIndex, 1, refundedTest);

    // after test refund
    const tubesAfterRefund = new Set<string>();
    order.tests.length &&
      order.tests.map((test: ITestsFromOrder) => {
        if ('testTube' in test.test && test.status !== 'refunded') {
          if (test.test?.hasTestTube) {
            test.test.testTube.forEach(tube =>
              tubesAfterRefund.add(tube.toString())
            );
          }
        }
      });

    const tubeToBeRefunded: string[] = [];
    tubesBeforeRefund.forEach((tube: string) => {
      if (!tubesAfterRefund.has(tube)) {
        tubeToBeRefunded.push(tube);
      }
    });

    // calcultaing the tube price to be refunded
    let refundedTubePrice = 0;
    let vatOnTube = 0;
    if (tubeToBeRefunded.length) {
      const tubes = await VacuumTube.aggregate([
        {
          $match: {
            _id: { $in: tubeToBeRefunded.map(t => new Types.ObjectId(t)) },
          },
        },
        {
          $group: {
            _id: null,
            totalPrice: { $sum: '$price' },
          },
        },
      ]);
      if (tubes.length) {
        const tubePrice = tubes[0].totalPrice;
        vatOnTube = (tubePrice * vat) / 100;
        refundedTubePrice = tubePrice + vatOnTube;
      }
    }

    if (order.dueAmount > netPriceOfTest) {
      dueAmount = dueAmount - netPriceOfTest - refundedTubePrice;
      refundApplied = netPriceOfTest + refundedTubePrice;
    }
    if (order.dueAmount <= netPriceOfTest) {
      remainingRefund = netPriceOfTest + refundedTubePrice - order.dueAmount;
      refundApplied = order.dueAmount;
      dueAmount = 0;
    }
    order.dueAmount = dueAmount;
    await Refund.create(
      [
        {
          discount: DiscountAmount,
          grossAmount: refundedTestPrice + refundedTubePrice,
          id: params.id,
          netAmount: netPriceOfTest + refundedTubePrice,
          oid: params.oid,
          refundedBy: params.refundedBy,
          vat: vatAmount + vatOnTube,
          refundApplied: refundApplied,
          remainingRefund: remainingRefund,
        },
      ],
      { session }
    );

    // Save the order using session
    await order.save({ session });

    await Transation.findOneAndUpdate(
      { ref: doesOrderExist._id, description: 'Payment for order' },
      {
        $inc: {
          refundAmount: netPriceOfTest + refundedTubePrice,
        },
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // Rollback the transaction if anything goes wrong
    await session.abortTransaction();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong'
    );
  } finally {
    // End the session
    session.endSession();
  }
};

const fetchAll = async () => {
  const refunds = await Refund.find({});
  return refunds;
};
// Utility function for calculating doctor commission
export const RefundService = { post, fetchAll };
