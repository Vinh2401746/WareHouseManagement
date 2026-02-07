import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ProductFormRef } from "./components/create-update-product";
import ProductFormModal from "./components/create-update-product";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import "./index.css";
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";
import { deleteProductApi, getProductsApi } from "../../../api/products";
import type { GetProductsRequestType } from "../../../types/products";
import { UNITS } from "../../../constants/common";
import { formatNumber } from "../../../utils/helper";
export const ProductsPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<ProductFormRef>(null);

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: [QueryKeys.products.list, { page, limit }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetProductsRequestType];
      return getProductsApi(payload);
    },
  });

    useEffect(()=>{
    if(isError){
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) =>
      deleteProductApi({ id: payload.id }),
    onSuccess: () => {
      dispatchToast("success", "Xoá sản phẩm thành công!");
      if((data?.totalResults  % ( (page - 1)  * limit) == 1) && page > 1){
       return setPage( page - 1 )
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
        render: (value) =>
          UNITS.find((item) => item.value == value)?.label || "",
      },
      {
        title: "Tồn kho tối thiểu",
        dataIndex: "minStock",
        key: "minStock",
        align: "center",
        render:(value) => <span style={{fontWeight:'bold'}}>{formatNumber(value)}</span>
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        align: "center",
        render: (value: any) => `${value?.name || ""}-${value?.code || ""}`,
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
              >
                Cập nhật
              </Tag>
              <Popconfirm
                title="Xác nhận xoá sản phẩm này?"
                cancelText="Huỷ"
                okText="Xác nhận"
                onConfirm={() => onAction("delete", record)}
              >
                <Tag color={"red"} variant={"outlined"}>
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
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
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
