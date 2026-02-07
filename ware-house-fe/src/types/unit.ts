export type GetUnitRequestType = {
  code?: string;
  name?: string;
  sortBy?: string;
  limit: number;
  page: number;
  // sortBy: Joi.string(),
};

export type PostunitType = {
  code: string;
  name: string;
};

export type UpdateUnitType = {
  unitId: string;
  code: string;
  name: string;
};


export type DeleteUnitType = {
  unitId: string;
  code: string;
  name: string;
};

