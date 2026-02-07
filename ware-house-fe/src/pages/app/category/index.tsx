import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Flex,
  Pagination,
  Popconfirm,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CategoryFormRef } from "./components/create-update-category";
import CategoryFormModal from "./components/create-update-category";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import './index.css'
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";

import { deleteCategory, getCategorysApi } from "../../../api/category";
import type { GetCategoriesRequestType } from "../../../types/category";
export const CategoryPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<CategoryFormRef>(null);
  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: [QueryKeys.category.list, page, limit],
    queryFn: ({ queryKey }) => {
    const [, payload] = queryKey as [string, GetCategoriesRequestType];
    return getCategorysApi(payload);
  },
    gcTime: 15 * 60 * 1000 // 15 phut cache
  });

    useEffect(()=>{
    if(isError){
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) => deleteCategory({ id: payload.id }),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Xoá danh mục thành công!");
      refetch()
    },
    onError: () => {
      dispatchToast("error", "Xoá danh mục thất bại!");
    },
  });

  const categories = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass", record: any) => {
      switch (type) {
        case "delete":
          mutate({ id: record.id });
          break;
        case "update":
          formRef.current?.show(record);
          break;
        default:
          break;
      }
    },
    [mutate],
  );

  const columns: ColumnsType = useMemo(() =>[
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
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
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
            >
              Cập nhật
            </Tag>
            <Popconfirm
              title="Xác nhận xoá danh mục này?"
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
    }
  ],[onAction]);

  return (
    <div style={{ rowGap: 24,  display: "flex",flexDirection:'column'}}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.category,
            title: (
              <>
                <UserOutlined />
                <span>Danh mục sản phẩm</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm danh mục
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={categories}
        columns={columns}
        pagination={false}
        loading={isLoading || isPending}
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
      <Flex justify="end" >
        <Pagination
          onShowSizeChange={(current, size) => {
            console.log("current", current, size);
            setLimit(size);
          }}
          // pageSize={page}
          total={data?.totalResults || 0}
          onChange={(page) => setPage(page)}
        />
      </Flex>
      <CategoryFormModal ref={formRef} />
    </div>
  );
});
