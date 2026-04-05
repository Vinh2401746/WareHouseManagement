import { useAppSelector } from "../store/hooks"
import type { permissionType } from "../types/auth"


export const usePermission = (module: keyof permissionType['permissions']) => {

    const currentPermisson = useAppSelector((state: any) => state.auth.permission?.permissions)
    const isSuperAdmin = useAppSelector((state: any) => {
        const user = state.auth.user;
        const permissionInfo = state.auth.permission;
        
        const roleName = user?.role?.name?.toLowerCase();
        const roleKeyUser = user?.roleKey?.toLowerCase();
        const permRole = permissionInfo?.role?.toLowerCase();
        const permRoleKey = permissionInfo?.roleKey?.toLowerCase();

        return [roleName, roleKeyUser, permRole, permRoleKey].some(r => 
            r === 'admin' || r === 'superadmin' || r === 'super admin'
        );
    });

    const isManager = isSuperAdmin || currentPermisson?.[module]?.join('')?.includes("manage") || false;
    const canView = isSuperAdmin || currentPermisson?.[module]?.join('')?.includes("get") || false;

    return {
        isManager,
        canView,
        isSuperAdmin
    }

}