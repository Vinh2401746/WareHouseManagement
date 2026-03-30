import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { getRolesApi, deleteRoleApi } from "../../../api/roles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RoleFormRef } from "./components/creat-update-role";
import RoleFormModal from "./components/creat-update-role";
import dispatchToast from "../../../constants/toast";
import { SafetyOutlined } from "@ant-design/icons";
import { TableCommon } from "../../../components/table/table";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";

const RolePage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<RoleFormRef>(null);
  const { isManager, canView } = usePermission("user");

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.role.list, page, limit],
    queryFn: () => getRolesApi({ page, limit }),
  });

  useEffect(() => {
    if (isError) {
      dispatchToast("error", error.message);
    }
  }, [error, isError]);

  const { mutate } = useMutation({
    mutationFn: (payload: { id: string }) => deleteRoleApi({ id: payload.id }),
    onSuccess: () => {
      dispatchToast("success", "Xoá Quyền thành công!");
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá Quyền thất bại, có thể quyền đang được dùng!");
    },
  });

  const roles = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update", record: any) => {
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

  const columns: ColumnsType = useMemo(() => [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => (page - 1) * limit + index + 1,
      align: "center",
      width: 80,
    },
    {
      title: "Mã Quyền",
      dataIndex: "key",
      key: "key",
      align: "center",
      render: (key) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: "Tên Vai Trò",
      dataIndex: "name",
      key: "name",
      align: "left",
    },
    {
      title: "Phạm Vi",
      dataIndex: "scope",
      key: "scope",
      align: "center",
      render: (scope) => <Tag color={scope === 'global' ? 'purple' : 'gold'}>{scope}</Tag>,
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      align: "left",
    },
    {
      title: "Tuỳ chọn",
      dataIndex: "",
      key: "action",
      align: "center",
      render(_, record) {
        return (
          <Flex vertical={false} gap={10} justify="center" style={{ cursor: "pointer" }}>
            <Tag
              color="green"
              onClick={() => {
                if(isManager) onAction("update", record)
              }}
            >
              Cập nhật
            </Tag>
            <Popconfirm
              title="Xác nhận xoá vai trò này?"
              cancelText="Huỷ"
              okText="Xác nhận"
              onConfirm={() => onAction("delete", record)}
              disabled={!isManager}
            >
              <Tag color="red">
                Xoá
              </Tag>
            </Popconfirm>
          </Flex>
        );
      },
    },
  ], [page, limit, onAction]);

  if (!canView) return <NoPermissonPage />;
  return (
    <div style={{ rowGap: 12, display: "flex", flexDirection: 'column' }}>
      <Breadcrumb
        items={[
          {
            href: "/roles",
            title: (
              <>
                <SafetyOutlined />
                <span>Vai Trò & Phân Quyền</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm Vai Trò Mới
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={roles}
        columns={columns}
        pagination={false}
        loading={isFetching}
        rowKey={"id"}
        onRow={(record) => {
          return {
            onDoubleClick: () => formRef.current?.show({ ...record } as any),
          };
        }}
      />
      <Flex justify="end">
        <Pagination
          onShowSizeChange={(_, size) => setLimit(size)}
          pageSize={limit}
          current={page}
          total={data?.totalResults || 0}
          onChange={(p) => setPage(p)}
        />
      </Flex>
      <RoleFormModal ref={formRef} onRecall={() => refetch()} />
    </div>
  );
});
export default RolePage;
