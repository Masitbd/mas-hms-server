import { Patient } from '../app/modules/patient/patient.model';

export const patientIdGenerator = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2, 4);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const dateData = year + month;
  const lastPatient = await Patient.find().sort({ createdAt: -1 }).limit(1);

  //   If this is the first order than the first order id will be 1
  if (lastPatient.length == 0) {
    return 'R' + dateData + '00001';
  }

  //   IF the date data is not same than the id will be 1
  const lastPatientId = lastPatient[0]?.uuid;
  const lastPatientDateData = lastPatientId?.slice(1, 5);
  if (dateData !== lastPatientDateData) {
    return 'R' + dateData + '00001';
  }

  //   IF the date data is same than the id will be next number
  const lastSerialNumber = lastPatientId?.slice(5);
  const nextSerialNumber =
    'R' + dateData + (Number(lastSerialNumber) + 1).toString().padStart(5, '0');
  return nextSerialNumber;
};
