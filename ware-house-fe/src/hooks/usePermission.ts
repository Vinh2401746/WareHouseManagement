import { useAppSelector } from "../store/hooks";
import type { permissionType } from "../types/auth";

const normalizeRoleKey = (value: unknown) => {
    if (!value) return "";
    return String(value).trim().toLowerCase();
};

export const usePermission = (module: keyof permissionType["permissionsByGroup"] | string) => {
    const permissionsByGroup = useAppSelector((state: any) => state.auth.permission?.permissionsByGroup);
    const roleKey = useAppSelector((state: any) => state.user?.user?.roleKey);

    const isSuperAdmin = normalizeRoleKey(roleKey) === "superadmin";
    const modulePermissions: string[] = permissionsByGroup?.[module as string] || [];

    const isManager = isSuperAdmin || modulePermissions.some((code) => String(code).startsWith("manage"));
    const canView = isSuperAdmin || modulePermissions.some((code) => String(code).startsWith("get"));

    return {
        isManager,
        canView,
        isSuperAdmin,
    };
};