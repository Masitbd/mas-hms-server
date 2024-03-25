import { Doctor } from '../app/modules/doctor/doctor.model';

export const findLastDoctorAmountNumber = async (): Promise<
  string | undefined
> => {
  const lastDoctor = await Doctor.findOne()
    .sort({
      account_number: -1,
    })
    .lean();

  return lastDoctor?.account_number
    ? lastDoctor.account_number.substring(2)
    : undefined;
};

export const generateDoctorAmountNumber = async (): Promise<string> => {
  const currentAmountNumber =
    (await findLastDoctorAmountNumber()) || (0).toString().padStart(6, '0');
  let inCreasedAmountNumber = (parseInt(currentAmountNumber) + 1)
    .toString()
    .padStart(5, '0');

  inCreasedAmountNumber = `D-${inCreasedAmountNumber}`;
  console.log(inCreasedAmountNumber, 'finalData');
  return inCreasedAmountNumber;
};
