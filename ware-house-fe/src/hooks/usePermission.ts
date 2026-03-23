import { useAppSelector } from "../store/hooks"
import type { permissionType } from "../types/auth"


export const usePermission = (module: keyof permissionType['permissions']) => {

    const currentPermisson = useAppSelector(state => state.auth.permission?.permissions)

    const isManager = currentPermisson?.[module]?.join('')?.includes("manage") || false
    const canView = currentPermisson?.[module]?.join('')?.includes("get") || false

    return {
        isManager,
        canView
    }

}