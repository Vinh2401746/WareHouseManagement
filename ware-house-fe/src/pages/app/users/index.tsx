import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
const UserPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<UserFormRef>(null);
  const {isManager,canView} = usePermission('user')
  const { data, isFetching, isError, error } = useQuery({
    queryKey: [QueryKeys.users.users, page, limit],
    queryFn: () => getUsers({ page, limit }),
    
  });

  useEffect(()=>{
    if(isError){
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate } = useMutation({
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

  if(!canView) return <NoPermissonPage />
  return (
    <div style={{ rowGap: 12,  display: "flex",flexDirection:'column'}}>
      <Breadcrumb
        items={[
          {
            href: "/users",
            title: (
              <>
                <UserOutlined />
                <span>Người dùng</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm Người Dùng
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={users}
        columns={columns}
        pagination={false}
        loading={isFetching}
        
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
          pageSize={limit}
          // pageSize={page}
          total={data?.totalResults || 0}
          onChange={(page) => setPage(page)}
        />
      </Flex>
      <UserFormModal ref={formRef} />
    </div>
  );
});
export default UserPage;