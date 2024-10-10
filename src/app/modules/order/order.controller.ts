import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { orderFilterableFields } from './order.constant';
import { IOrder, IorderFilterableFields } from './order.interface';
import { OrderService } from './order.service';

const createNewOrder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const data: IOrder = req.body;
    data.postedBy = req?.user?.uuid;
    const result = await OrderService.postOrder(req.body);

    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order created successfully',
      data: result as unknown as IOrder,
    });
  }
);

const getAllOrder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filterableField = pick<Request['query'], IorderFilterableFields>(
      req.query,
      orderFilterableFields
    );

    const paginationOption = pick(req.query, paginationFields);

    const result = await OrderService.fetchAll({
      filterableField,
      paginationOption,
    });

    sendResponse<IOrder[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order featched successfully',
      data: result.data,
      meta: {
        limit: result.limit,
        page: result.page,
        total: result.totalData,
      },
    });
  }
);

const updateOrder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await OrderService.orderPatch({
      id: req.params.id,
      data: req.body,
    });

    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order featched successfully',
      data: result,
    });
  }
);

const getInvoice = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await OrderService.fetchIvoice(req.params.oid);
    // res.send(result);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order featched successfully',
      data: result,
    });
  }
);

const getSIngle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await OrderService.fetchSingle(req.params.oid);
    // res.send(result);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order featched successfully',
      data: result,
    });
  }
);

const dueCollection = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = req?.user?.uuid;
    const result = await OrderService.dueCollection(
      req.body,
      req.params.oid,
      user
    );
    // res.send(result);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order featched successfully',
      data: result,
    });
  }
);

const statusChanger = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = req?.user?.uuid;
    const result = await OrderService.singleOrderstatusChanger({
      oid: req.params.oid,
      reportGroup: req.body.reportGroup,
      status: req.body.status,
      user: user,
    });
    // res.send(result);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Status changed successfully',
      data: result,
    });
  }
);

const getIncomeStatement = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getIncomeStatementFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Income Statement retrived successfully',
    data: result,
  });
});
const getDueDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getDueBillsDetailFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'due dettails featched successfully',
    data: result,
  });
});

const getOrderPostedBy = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.fetchOrderPostedBy();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order Posted By featched successfully',
    data: result,
  });
});

export const OrderController = {
  createNewOrder,
  getAllOrder,
  updateOrder,
  getInvoice,
  dueCollection,
  getSIngle,
  statusChanger,
  getIncomeStatement,
  getDueDetails,
  getOrderPostedBy,
};
