import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  DatabaseOutlined,
  ShopOutlined,
  ImportOutlined,
  FileDoneOutlined,
  FunctionOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Menu, type MenuProps } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import "./menu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "../../router/routes";
import {  useAppSelector } from "../../store/hooks";

const { Sider } = Layout;

const ROUTE_PERMISSIONS: Record<string, string> = {
  [AppRoutes.user.list]: "user",
  [AppRoutes.role]: "rbac",
  [AppRoutes.products]: "products",
  [AppRoutes.supplier]: "suppliers",
  [AppRoutes.customer]: "customers", // Cập nhật đúng permission của mình
  [AppRoutes.unit.list]: "units",
  [AppRoutes.warehouse.list]: "warehouses",
  [AppRoutes.branch.list]: "branches",
  [AppRoutes.warehouse_import_export]: "inventoryTransactions",
  [AppRoutes.warehouse_transfer]: "warehouseTransfers",
  [AppRoutes.sales_invoice]: "sales",
  [AppRoutes.inventory_batches]: "products", // temporary map to products read
};

const items: ItemType<MenuItemType>[] = [
  {
    key: AppRoutes.home.dashboard,
    icon: <HomeOutlined />,
    label: "Tổng quan",
  },
  {
    key: "sub-business",
    label: "Nghiệp vụ",
    children: [
      {
        key: AppRoutes.sales_invoice,
        icon: <FileDoneOutlined />,
        label: "Hoá đơn bán hàng",
      },
      {
        key: AppRoutes.warehouse_import_export,
        icon: <ImportOutlined />,
        label: "Nhập/Xuất kho",
      },
      {
        key: AppRoutes.warehouse_transfer,
        icon: <ImportOutlined />,
        label: "Luân chuyển kho",
      },
    ],
  },
  {
    key: "sub-master-data",
    label: "Danh mục",
    children: [
      {
        key: AppRoutes.products,
        icon: <AppstoreOutlined />,
        label: "Sản phẩm",
      },
      {
        key: AppRoutes.inventory_batches,
        icon: <DatabaseOutlined />,
        label: "Danh sách Lô hàng",
      },
      {
        key: AppRoutes.customer,
        icon: <UserOutlined />,
        label: "Khách hàng",
      },
      {
        key: AppRoutes.supplier,
        icon: <ContactsOutlined />,
        label: "Nhà cung cấp",
      },
      {
        key: AppRoutes.unit.list,
        icon: <FunctionOutlined />,
        label: "Đơn vị",
      },
    ],
  },
  {
    key: "sub-organization",
    label: "Tổ chức",
    children: [
      {
        key: AppRoutes.branch.list,
        icon: <ShopOutlined />,
        label: "Cửa hàng",
      },
      {
        key: AppRoutes.warehouse.list,
        icon: <DatabaseOutlined />,
        label: "Kho",
      },
    ],
  },
  {
    key: "sub-system",
    label: "Hệ thống",
    children: [
      {
        key: AppRoutes.user.list,
        icon: <UserOutlined />,
        label: "Người dùng",
      },
      {
        key: AppRoutes.role,
        icon: <SafetyOutlined />,
        label: "Vai trò & Phân quyền",
      },
    ],
  },
];

const filterMenuItemsByPermission = (
  menuItems: ItemType<MenuItemType>[],
  opts: {
    isSuperAdmin: boolean;
    currentPermisson: Record<string, string[]> | undefined;
  },
): ItemType<MenuItemType>[] => {
  const canSeeRoute = (routeKey: string) => {
    if (routeKey === AppRoutes.home.dashboard) return true;

    // RBAC UI: chỉ Superadmin được thấy
    if (routeKey === AppRoutes.role) return opts.isSuperAdmin;
    if (opts.isSuperAdmin) return true;

    const module = ROUTE_PERMISSIONS[routeKey];
    if (!module) return true;

    const modulePermissions: string[] = opts.currentPermisson?.[module] || [];
    return modulePermissions.some((code) => String(code).startsWith("get"));
  };

  const walk = (list: ItemType<MenuItemType>[]): ItemType<MenuItemType>[] => {
    return (list || [])
      .map((item) => {
        if (!item) return null;

        // Leaf route item
        if ((item as any).key && !(item as any).children) {
          const key = String((item as any).key);
          return canSeeRoute(key) ? item : null;
        }

        // Group/submenu item
        const children = walk(((item as any).children || []) as ItemType<MenuItemType>[]);
        if (!children.length) return null;

        return {
          ...(item as any),
          children,
        } as ItemType<MenuItemType>;
      })
      .filter(Boolean) as ItemType<MenuItemType>[];
  };

  return walk(menuItems);
};

export const MenusApp = () => {
  const { collapsed } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();



  const onClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      navigate(e?.keyPath[0]);
    },
    [navigate],
  );

  const currentPermisson = useAppSelector((state: any) => state.auth.permission?.permissionsByGroup);
  const roleKey = useAppSelector((state: any) => state.user?.user?.roleKey);
  const isSuperAdmin = String(roleKey || "").trim().toLowerCase() === "superadmin";

  const filteredItems = filterMenuItemsByPermission(items, { isSuperAdmin, currentPermisson });

  const allVisibleSubmenuKeys = useMemo(() => {
    return filteredItems
      .filter((item) => Boolean((item as any)?.children?.length))
      .map((item) => String((item as any).key));
  }, [filteredItems]);

  const routeToSubmenuKey = useMemo(() => {
    return {
      [AppRoutes.sales_invoice]: "sub-business",
      [AppRoutes.warehouse_import_export]: "sub-business",
      [AppRoutes.warehouse_transfer]: "sub-business",

      [AppRoutes.products]: "sub-master-data",
      [AppRoutes.inventory_batches]: "sub-master-data",
      [AppRoutes.customer]: "sub-master-data",
      [AppRoutes.supplier]: "sub-master-data",
      [AppRoutes.unit.list]: "sub-master-data",

      [AppRoutes.branch.list]: "sub-organization",
      [AppRoutes.warehouse.list]: "sub-organization",

      [AppRoutes.user.list]: "sub-system",
      [AppRoutes.role]: "sub-system",
    } as Record<string, string>;
  }, []);

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const lastOpenKeysRef = useRef<string[]>([]);
  const didInitOpenKeysRef = useRef(false);

  useEffect(() => {
    if (collapsed) {
      lastOpenKeysRef.current = openKeys;
      setOpenKeys([]);
      return;
    }

    // Restore the previous open submenu (if any); otherwise open the submenu
    // that contains the current route.
    const parentKey = routeToSubmenuKey[location.pathname];
    const restored = lastOpenKeysRef.current;
    const nextOpenKeys = restored?.length
      ? restored
      : allVisibleSubmenuKeys.length
        ? allVisibleSubmenuKeys
        : parentKey
          ? [parentKey]
          : [];
    setOpenKeys(nextOpenKeys);
    lastOpenKeysRef.current = nextOpenKeys;
  }, [collapsed]);

  useEffect(() => {
    // Default behavior: when user first lands (permissions loaded), expand all groups.
    if (collapsed) return;
    if (didInitOpenKeysRef.current) return;
    if (!allVisibleSubmenuKeys.length) return;

    setOpenKeys(allVisibleSubmenuKeys);
    lastOpenKeysRef.current = allVisibleSubmenuKeys;
    didInitOpenKeysRef.current = true;
  }, [collapsed, allVisibleSubmenuKeys]);

  useEffect(() => {
    if (collapsed) {
      // When sidebar is collapsed, close all submenus.
      return;
    }

    const parentKey = routeToSubmenuKey[location.pathname];
    if (!parentKey) return;

    setOpenKeys((prev) => {
      if (prev.includes(parentKey)) return prev;
      const next = [...prev, parentKey];
      lastOpenKeysRef.current = next;
      return next;
    });
  }, [collapsed, location.pathname, routeToSubmenuKey]);

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const nextOpenKeys = (keys || []).map((k) => String(k));
    setOpenKeys(nextOpenKeys);
    lastOpenKeysRef.current = nextOpenKeys;
    didInitOpenKeysRef.current = true;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      collapsedWidth={0}
      breakpoint="lg"
    >
      <Flex gap={10} align="center" justify="center" style={{ marginTop: 10 }}>
        {/* {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: "bold" }}>KHO</span>
        )} */}
      </Flex>
      <Menu
        onClick={onClick}
        style={{ marginTop: 24 }}
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[AppRoutes.home.dashboard]}
        items={filteredItems}
        selectedKeys={[location.pathname]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        
      />
    </Sider>
  );
};


