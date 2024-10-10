import { IMiscellaneous } from './miscellaneous.interface';
import { Miscellaneous } from './miscellaneous.model';

const post = async (params: IMiscellaneous) => {
  return await Miscellaneous.create(params);
};

const patch = async (data: IMiscellaneous, id: string) => {
 
  return await Miscellaneous.findOneAndUpdate({ _id: id }, data);
};

const remove = async (id: string) => {
  return await Miscellaneous.findByIdAndDelete(id);
};

const getSingle = async (id: string) => {
  return await Miscellaneous.findById(id);
};

const getALl = async (filterOption: string) => {
  let condition = {};
  if (filterOption) {
    condition = {
      title: { $regex: filterOption, $options: 'i' },
    };
  }

  return await Miscellaneous.find(condition);
};

//  get onley margin data

const getMarginDataFromDB = async () => {
  const result = await Miscellaneous.findOne({
    title: 'margin',
  });

  return result;
};

export const MiscellaneousService = {
  post,
  patch,
  remove,
  getSingle,
  getALl,
  getMarginDataFromDB,
};
