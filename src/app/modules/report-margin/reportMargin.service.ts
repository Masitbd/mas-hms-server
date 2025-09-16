import { Margin, MarginModel } from './reportMargin.model';

const createMargin = async (payload: Margin) => {
  await MarginModel.deleteMany();
  return await MarginModel.create(payload);
};

const getMargin = async () => {
  return await MarginModel.find();
};
export const MarginService = {
  createMargin,
  getMargin,
};
