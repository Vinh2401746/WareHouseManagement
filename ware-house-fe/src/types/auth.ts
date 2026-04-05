export type AuthRequestLoginType = {
  email: string;
  password: string;
};

export type AuthResponseLoginType = {
  user: {
    role: string;
    isEmailVerified: boolean;
    email: string;
    name: string;
    id: string;
    roleKey: string;
    branch: {
      name: string,
      phone: string,
      address: string,
      id: string
    },
  };
  tokens: {
    access: {
      token: string | null;
      expires: Date | null;
    };
    refresh: {
      token: string | null;
      expires: Date | null;
    };
  };
};


export type roles = string | null;
// {
//     "userId": "699e6094c97cd347e08563b1",
//     "role": "admin",
//     "permissions": {
//         "user": [
//             "getUsers",
//             "manageUsers"
//         ],
//         "branches": [
//             "getBranches",
//             "manageBranches"
//         ],
//         "warehouses": [
//             "getWarehouses",
//             "manageWarehouses"
//         ],
//         "products": [
//             "getProducts",
//             "manageProducts"
//         ],
//         "suppliers": [
//             "getSuppliers",
//             "manageSuppliers"
//         ],
//         "customers": [
//             "getCustomers",
//             "manageCustomers"
//         ],
//         "productBatchs": [
//             "getProductBatchs",
//             "manageProductBatchs"
//         ],
//         "inventoryTransactions": [
//             "getInventoryTransactions",
//             "manageInventoryTransactions"
//         ],
//         "sales": [
//             "getSales",
//             "manageSales"
//         ],
//         "units": [
//             "getUnits",
//             "manageUnits"
//         ]
//     }
// }


export type permissionType = {
  "userId": string,
  "role": string,
  "permissions": {
    "user": string[],
    "branches": string[],
    "warehouses": string[],
    "products": string[],
    "suppliers": string[],
    "customers": string[],
    "productBatchs": string[],
    "inventoryTransactions": string[],
    "sales": string[],
    "units": string[]
  }

}