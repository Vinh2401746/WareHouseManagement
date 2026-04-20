import type { roles } from "./auth"


export type UpdateUserType = {
      email: string,
      name: string,
      id:string,
      role: roles,
      branch?: string,
      password?: string,
}