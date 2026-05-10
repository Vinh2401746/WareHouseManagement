import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag, Input } from "antd";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import type { CustomerFormRef } from "./components/create-update-customer";
import CustomerFormModal from "./components/create-update-customer";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";
import { deleteCustomerApi, exportCurrentCustomers, getCustomersApi, getTemplateCustomer, importTemplateCustomer } from "../../../api/customer";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
import { formatNumber } from "../../../utils/helper";

const CustomerPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<CustomerFormRef>(null);
  
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  // Change permissions to 'customers'
  const { isManager, canView, isSuperAdmin } = usePermission("customers"); 
  
  const { data, refetch, isFetching, error, isError } = useQuery({
    queryKey: ["customers.list", { page, limit, searchName }],
    queryFn: () => getCustomersApi({ page, limit, name: searchName }),
  });

  useEffect(() => {
    if (isError && error) {
      dispatchToast("error", error.message);
    }
  }, [error, isError]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) => deleteCustomerApi(payload.id),
    onSuccess: () => {
      dispatchToast("success", "Xoá khách hàng thành công!");
      if ((data?.totalResults % ((page - 1) * limit) === 1) && page > 1) {
        return setPage(page - 1);
      }
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá khách hàng thất bại!");
    },
  });

  const customers = useMemo(() => data?.results ?? [], [data?.results]);

  const { mutate: downloadTemplate } = useMutation({
    mutationFn: getTemplateCustomer,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "customer_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Tải file mẫu thất bại!");
    },
  });

  const { mutate: importCustomer } = useMutation({
    mutationFn: importTemplateCustomer,
    onSuccess: (res: any) => {
      if (res?.errors?.length === 0) {
        dispatchToast("success", "Nhập khách hàng thành công!");
        refetch();
        return;
      }
      dispatchToast("error", res?.errors?.[0]?.errors?.[0] || "Mẫu đẩy lên không đúng quy định!");
    },
    onError: () => {
      dispatchToast("error", "Nhập file thất bại!");
    },
  });

  const { mutate: exportCustomers } = useMutation({
    mutationFn: exportCurrentCustomers,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Xuất khách hàng thất bại!");
    },
  });

  const utitilesAction = (action: "template" | "import" | "export") => {
    switch (action) {
      case "template":
        downloadTemplate();
        break;
      case "import": {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx,.xls";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            importCustomer({ file });
          }
        };
        input.click();
        break;
      }
      case "export":
        exportCustomers();
        break;
      default:
        break;
    }
  };

  const onAction = useCallback(
    (type: "delete" | "update" | "view", record: any) => {
      switch (type) {
        case "delete":
          mutate({ id: record.id });
          break;
        case "update":
          formRef.current?.show(record);
          break;
        case "view":
          navigate(`/customer/${record.id}`);
          break;
        default:
          break;
      }
    },
    [mutate, navigate],
  );

  const columns: ColumnsType = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "id",
        key: "id",
        render: (_, __, index) => index + 1 + (page - 1) * limit,
        align: "center",
        width: 80,
      },
      {
        title: "Tên khách hàng",
        dataIndex: "name",
        key: "name",
        align: "center",
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        align: "center",
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        align: "center",
      },
      {
        title: "Tổng nợ",
        dataIndex: "totalDebt",
        key: "totalDebt",
        align: "center",
        render(value) {
           return <span style={{ color: value > 0 ? "red" : "green", fontWeight: 500 }}>{formatNumber(value)} đ</span>
        }
      },
      {
        title: "Tuỳ chọn",
        dataIndex: "",
        key: "",
        align: "center",
        render(_, record) {
          return (
            <Flex
              vertical={false}
              gap={10}
              justify="center"
              style={{ cursor: "pointer" }}
            >
              <Tag
                color={"blue"}
                variant={"outlined"}
                onClick={() => onAction("view", record)}
              >
                Chi tiết
              </Tag>
              <Tag
                color={"green"}
                variant={"outlined"}
                onClick={() => onAction("update", record)}
                disabled={!isManager}
              >
                Cập nhật
              </Tag>
              <Popconfirm
                title="Xác nhận xoá khách hàng này?"
                cancelText="Huỷ"
                okText="Xác nhận"
                onConfirm={() => onAction("delete", record)}
              >
                <Tag color={"red"} variant={"outlined"} disabled={!isManager}>
                  Xoá
                </Tag>
              </Popconfirm>
            </Flex>
          );
        },
      },
    ],
    [onAction, isManager, page, limit],
  );

  if (!canView) return <NoPermissonPage />;
  
  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.customer,
            title: (
              <>
                <UserOutlined />
                <span>Khách hàng</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="space-between" wrap="wrap" gap={12}>
        <Input.Search 
          placeholder="Tìm kiếm theo tên..." 
          allowClear 
          onSearch={(value) => setSearchName(value)}
          style={{ width: 300 }} 
        />
        <Flex wrap="wrap" justify="end" gap={8}>
          <Button type="primary" onClick={() => utitilesAction("template")} disabled={!isManager}>
            Tải file mẫu
          </Button>
          <Button type="primary" onClick={() => utitilesAction("import")} disabled={!isManager || isSuperAdmin}>
            Tải danh sách khách hàng
          </Button>
          <Button type="primary" onClick={() => utitilesAction("export")} disabled={!isManager}>
            Xuất khách hàng hiện có
          </Button>
          <Button type="primary" onClick={() => formRef.current?.show()} disabled={!isManager || isSuperAdmin}>
            Thêm khách hàng
          </Button>
        </Flex>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={customers}
        columns={columns}
        pagination={false}
        loading={isFetching || isPending}
        rowKey={"id"}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              navigate(`/customer/${record.id}`);
            },
          };
        }}
      />
      <Flex justify="end">
        <Pagination
          onShowSizeChange={(_, size) => {
            setLimit(size);
          }}
          pageSize={limit}
          total={data?.totalResults || 0}
          current={page}
          onChange={(p) => {
            setPage(p);
          }}
        />
      </Flex>
      <CustomerFormModal
        onSuccess={() => {
          refetch();
          formRef.current?.hide();
        }}
        ref={formRef}
      />
    </div>
  );
});

export default CustomerPage;
