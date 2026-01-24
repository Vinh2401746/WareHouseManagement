const keyQueryFilterString = (obj: object | any):string => {
  const queryString = `${Object.entries(obj)
    .filter((value) => value[1] || value[1] === 0)
    .map((item) => `${item[0]}=${item[1]}`)
    .join("&")}`;
  return queryString;
};

export { keyQueryFilterString };
