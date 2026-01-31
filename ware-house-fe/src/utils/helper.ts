const keyQueryFilterString = (obj: object | any):string => {
  const queryString = `${Object.entries(obj)
    .filter((value) => value[1] || value[1] === 0)
    .map((item) => `${item[0]}=${item[1]}`)
    .join("&")}`;
  return queryString;
};

const formatNumber = (value: number | string) =>
  Number(value).toLocaleString("vi-VN");

 // "12.484.288"

export { keyQueryFilterString,formatNumber };
