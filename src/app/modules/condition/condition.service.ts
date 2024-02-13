import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { ICondition } from './condition.interface';
import { Condition } from './condition.model';

const postCondition = async (
  payload: ICondition
): Promise<null | ICondition> => {
  const result = await Condition.create(payload);
  return result;
};

const patchCondition = async (payload: Partial<ICondition>, id: string) => {
  const result = await Condition.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteCondition = async (id: string) => {
  const result = await Condition.findOneAndDelete({ _id: id });
  return result;
};
const fetchSingleCondition = async (id: string) => {
  const result = await Condition.findOne({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Condition not Found');
  }
  return result;
};

const fetchAllCondition = async () => {
  const result = await Condition.find();
  return result;
};

export const ConditionService = {
  postCondition,
  fetchAllCondition,
  fetchSingleCondition,
  patchCondition,
  deleteCondition,
};
