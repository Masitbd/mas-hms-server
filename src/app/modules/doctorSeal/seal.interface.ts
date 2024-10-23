export type IDoctorSeal = {
  _id?: string;
  title: string;
  seal: string;
  default: boolean;
};

export const sealFilterableFields = ['default', 'title'];
export type ISealFilterableFields = 'default' | 'title';
