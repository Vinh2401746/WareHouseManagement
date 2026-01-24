import { memo, useCallback, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { deleteUser, getUsers } from "../../../api/users/users";
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
import type { UserFormRef } from "./components/creat-update-user";
import UserFormModal from "./components/creat-update-user";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import './index.css'
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";
import { getProductsApi } from "../../../api/products";
import type { GetProductsRequestType } from "../../../types/products";
export const ProductsPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<UserFormRef>(null);
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.products.list],
    queryFn: ({ queryKey }) => {
    const [, payload] = queryKey as [string, GetProductsRequestType];
    return getProductsApi(payload);
  },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) => deleteUser({ id: payload.id }),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Xoá người dùng thành công!");
    },
    onError: () => {
      dispatchToast("error", "Xoá người dùng thất bại!");
    },
  });

  const users = useMemo(() => data?.results ?? [], [data?.results]);

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

  const columns: ColumnsType = useMemo(() =>[
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 100,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
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
              title="Xác nhận đặt lại mật khẩu user này?"
              cancelText="Huỷ"
              okText="Xác nhận"
              onConfirm={() => onAction("reset-pass", record)}
            >
              <Tag color={"yellow"} variant={"outlined"}>
                Đặt lại mật khẩu
              </Tag>
            </Popconfirm>
            <Popconfirm
              title="Xác nhận xoá user này?"
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
            href: AppRoutes.goods,
            title: (
              <>
                <UserOutlined />
                <span>Hàng hoá</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm hàng hoá
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={users}
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
      <UserFormModal ref={formRef} />
    </div>
  );
});
