import type { roles } from "./auth"


export type UpdateUserType = {
      email: string,
      password: string,
      name: string,
      id:string,
      role: roles
}