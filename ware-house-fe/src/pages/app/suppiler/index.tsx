import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SupplierFormRef } from "./components/create-update-product";
import SupplierFormModal from "./components/create-update-product";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import "./index.css";
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";
import type { GetSuppliersRequestType } from "../../../types/supplier";
import { deleteSuplierApi, exportCurrentSuppliers, getSuppliersApi, getTemplateSupplier, importTemplateSupplier } from "../../../api/supplier";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
const SuppilerPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<SupplierFormRef>(null);
      const {isManager,canView} = usePermission("suppliers")
  const { data, refetch, isFetching, error,isError } = useQuery({
    queryKey: [QueryKeys.supplier.list, { page, limit }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetSuppliersRequestType];
      return getSuppliersApi(payload);
    },
  });

    useEffect(()=>{
    if(isError){
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) =>
      deleteSuplierApi({ id: payload.id }),
    onSuccess: () => {
      dispatchToast("success", "Xoá nhà cung cấp thành công!");
      if((data?.totalResults  % ( (page -1)  * limit) == 1) && page > 1){
       return setPage( page - 1 )
      }
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá nhà cung cấp thất bại!");
    },
  });

  const supplier = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass", record: any) => {
      switch (type) {
        case "delete":
          mutate({ id: record.id });
          break;
        case "update":
          formRef.current?.show(record);
          break;
        case "reset-pass":
          dispatchToast("warning", "Tính năng đang phát triển");
          // formRef.current?.show(record);
          break;
        default:
          break;
      }
    },
    [mutate],
  );

  const columns: ColumnsType = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "id",
        key: "id",
        render: (_, __, index) => index + 1,
        align: "center",
        width: 80,
      },
      {
        title: "Tên",
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
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "center",
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        align: "center",
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
                color={"green"}
                variant={"outlined"}
                onClick={() => onAction("update", record)}
                disabled={!isManager}
              >
                Cập nhật
              </Tag>
              <Popconfirm
                title="Xác nhận xoá nhà cung cấp này?"
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
    [isManager, onAction],
  );

  const { mutate: downloadTemplate } = useMutation({
    mutationFn: getTemplateSupplier,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "supplier_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Tải file mẫu thất bại!");
    },
  });

  const { mutate: importSupplier } = useMutation({
    mutationFn: importTemplateSupplier,
    onSuccess: (res: any) => {
      if (res?.errors?.length === 0) {
        dispatchToast("success", "Nhập nhà cung cấp thành công!");
        refetch();
        return;
      }
      dispatchToast("error", res?.errors?.[0]?.errors?.[0] || "Mẫu đẩy lên không đúng quy định!");
    },
    onError: () => {
      dispatchToast("error", "Nhập file thất bại!");
    },
  });

  const { mutate: exportSuppliers } = useMutation({
    mutationFn: exportCurrentSuppliers,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "suppliers.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Xuất nhà cung cấp thất bại!");
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
        input.accept = ".xlsx";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) importSupplier(file);
        };
        input.click();
        break;
      }
      case "export":
        exportSuppliers();
        break;
      default:
        break;
    }
  };

  if(!canView) return <NoPermissonPage />
  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.supplier,
            title: (
              <>
                <UserOutlined />
                <span>Nhà cung cấp</span>
              </>
            ),
          },
        ]}
      />
        <Flex wrap="wrap" justify="end" gap={8}>
          <Button type="primary" onClick={() => utitilesAction("template")}  disabled={!isManager}>
            Tải file mẫu
          </Button>
          <Button type="primary" onClick={() => utitilesAction("import")}  disabled={!isManager}>
            Tải danh sách nhà cung cấp
          </Button>
          <Button type="primary" onClick={() => utitilesAction("export")}  disabled={!isManager}>
            Xuất nhà cung cấp hiện có
          </Button>
        <Button type="primary" onClick={() => formRef.current?.show()}    disabled={!isManager}>
          Thêm nhà cung cấp
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={supplier}
        columns={columns}
        pagination={false}
        loading={isFetching || isPending}
        rowKey={"id"}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              formRef.current?.show({ ...record });
            },
          };
        }}
        // scroll={{ y: 500 }}
      />
      <Flex justify="end">
        <Pagination
          onShowSizeChange={(_, size) => {
            setLimit(size);
          }}
          pageSize={limit}
          total={data?.totalResults || 0}
          onChange={(page) => {
            // console.log("page", page)
            setPage(page);
          }}
        />
      </Flex>
      <SupplierFormModal
        onSuccess={() => {
          refetch();
          formRef.current?.hide();
        }}
        ref={formRef}
      />
    </div>
  );
});


export default SuppilerPage