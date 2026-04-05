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
import { getCustomersApi, deleteCustomerApi } from "../../../api/customer";
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
  const { isManager, canView } = usePermission("customers"); 
  
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
      <Flex justify="space-between">
        <Input.Search 
          placeholder="Tìm kiếm theo tên..." 
          allowClear 
          onSearch={(value) => setSearchName(value)}
          style={{ width: 300 }} 
        />
        <Button type="primary" onClick={() => formRef.current?.show()} disabled={!isManager}>
          Thêm khách hàng
        </Button>
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
