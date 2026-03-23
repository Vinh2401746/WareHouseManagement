import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Image, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ProductFormRef } from "./components/create-update-product";
import ProductFormModal from "./components/create-update-product";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import "./index.css";
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";
import { deleteProductApi, exportCurrentExProduct, getProductsApi, getTemplateProduct, importTemplateProduct } from "../../../api/products";
import type { GetProductsRequestType } from "../../../types/products";
import { ROOT_IMAGE_IMAGE, UNITS } from "../../../constants/common";
import { formatNumber } from "../../../utils/helper";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
const ProductsPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<ProductFormRef>(null);
  const { isManager, canView } = usePermission("products")
  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: [QueryKeys.products.list, { page, limit }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetProductsRequestType];
      return getProductsApi(payload);
    },
  });

  useEffect(() => {
    if (isError) {
      dispatchToast("error", error.message)
    }
  }, [error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) =>
      deleteProductApi({ id: payload.id }),
    onSuccess: () => {
      dispatchToast("success", "Xoá sản phẩm thành công!");
      if ((data?.totalResults % ((page - 1) * limit) == 1) && page > 1) {
        return setPage(page - 1)
      }
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá sản phẩm thất bại!");
    },
  });

  const products = useMemo(() => data?.results ?? [], [data?.results]);

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
        title: "Ảnh sản phẩm",
        dataIndex: "imageUrl",
        key: "imageUrl",
        align: "center",
        render: (image) => image ? <Image
          width={50}
          height={50}
          alt="basic"
          src={`${ROOT_IMAGE_IMAGE}${image}`}
        /> : ''
      },
      {
        title: "Mã hàng hoá",
        dataIndex: "code",
        key: "code",
        align: "center",
      },
      {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        align: "center",
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        align: "center",
        render: (value: any) => value?.name || ''
      },
      {
        title: "Tồn kho tối thiểu",
        dataIndex: "minStock",
        key: "minStock",
        align: "center",
        render: (value) => <span style={{ fontWeight: 'bold' }}>{formatNumber(value)}</span>
      },
      // {
      //   title: "Danh mục",
      //   dataIndex: "category",
      //   key: "category",
      //   align: "center",
      //   render: (value: any) => `${value?.name || ""}`,
      // },
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
                title="Xác nhận xoá sản phẩm này?"
                cancelText="Huỷ"
                okText="Xác nhận"
                onConfirm={() => onAction("delete", record)}
              >
                <Tag color={"red"} variant={"outlined"}  disabled={!isManager}>
                  Xoá
                </Tag>
              </Popconfirm>
            </Flex>
          );
        },
      },
    ],
    [onAction],
  );


  const { mutate: downloadTemplate } = useMutation({
    mutationFn: getTemplateProduct,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_product.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Tải file mẫu thất bại!");
    },
  });

  const { mutate: importProduct } = useMutation({
    mutationFn: importTemplateProduct,
    onSuccess: (res: any) => {
      console.log("res", res)
      if (res?.errors.length == 0) {
        dispatchToast("success", "Nhập sản phẩm thành công!");
        refetch();
        return;
      }
      dispatchToast("error", res?.errors?.[0].errors[0] || "Mẫu đẩy lên không đúng quy định!");
    },
    onError: () => {
      dispatchToast("error", "Nhập file thất bại!");
    },
  });

  const { mutate: exportProducts } = useMutation({
    mutationFn: exportCurrentExProduct,
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      dispatchToast("error", "Xuất sản phẩm thất bại!");
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
          if (file) importProduct(file);
        };
        input.click();
        break;
      }
      case "export":
        exportProducts();
        break;
      default:
        break;
    }
  };

  if (!canView) return <NoPermissonPage />

  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.products,
            title: (
              <>
                <UserOutlined />
                <span>sản phẩm</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end" gap={8}>
        <Button type="primary" onClick={() => utitilesAction("template")}  disabled={!isManager}>
          Tải file mẫu
        </Button>
        <Button type="primary" onClick={() => utitilesAction("import")}  disabled={!isManager}>
          Tải danh sách sản phẩm
        </Button>
        <Button type="primary" onClick={() => utitilesAction("export")}  disabled={!isManager}>
          Xuất sản phẩm hiện có
        </Button>
        <Button type="primary" onClick={() => formRef.current?.show()}  disabled={!isManager}>
          Thêm sản phẩm
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={products}
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
      <ProductFormModal
        onSuccess={() => {
          refetch();
          formRef.current?.hide();
        }}
        ref={formRef}
      />
    </div>
  );
});


export default ProductsPage