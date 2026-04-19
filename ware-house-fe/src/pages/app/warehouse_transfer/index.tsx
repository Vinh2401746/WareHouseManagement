import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag, Modal, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { AppRoutes } from "../../../router/routes";
import { TableCommon } from "../../../components/table/table";
import { QueryKeys } from "../../../constants/query-keys";
import dispatchToast from "../../../constants/toast";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
import { useAppSelector } from "../../../store/hooks";

import type { GetWarehouseTransfersRequest, WarehouseTransferResponse } from "../../../types/warehouseTransfer";
import {
  approveWarehouseTransferApi,
  cancelWarehouseTransferApi,
  getWarehouseTransfersApi,
} from "../../../api/warehouseTransfer";

const WarehouseTransferPage = memo(() => {
  const navigate = useNavigate();
  const { canView, isManager, isSuperAdmin } = usePermission("warehouseTransfers");

  const permissionMap = useAppSelector((state: any) => state.auth.permission?.permissionsByGroup);
  const currentUserId = useAppSelector((state: any) => state.user?.user?.id);

  const canCreate =
    isSuperAdmin ||
    permissionMap?.warehouseTransfers?.join("")?.includes("create") ||
    permissionMap?.warehouseTransfers?.includes("createWarehouseTransfers") ||
    false;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRecord, setCancelRecord] = useState<WarehouseTransferResponse | null>(null);

  const { data, refetch, isError, error, isFetching } = useQuery({
    queryKey: [QueryKeys.warehouseTransfer.list, { page, limit, status }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetWarehouseTransfersRequest];
      return getWarehouseTransfersApi(payload);
    },
  });

  useEffect(() => {
    if (isError) {
      dispatchToast("error", (error as any)?.message || "Không tải được danh sách luân chuyển kho");
    }
  }, [error, isError]);

  const transfers = useMemo(() => data?.results ?? [], [data?.results]);

  const { mutate: approveMutate, isPending: approving } = useMutation({
    mutationFn: (id: string) => approveWarehouseTransferApi(id),
    onSuccess: () => {
      dispatchToast("success", "Duyệt phiếu luân chuyển thành công!");
      refetch();
    },
    onError: (e: any) => {
      dispatchToast("error", e?.response?.data?.message || "Duyệt phiếu luân chuyển thất bại!");
    },
  });

  const { mutate: cancelMutate, isPending: canceling } = useMutation({
    mutationFn: (payload: { id: string; cancelReason?: string }) =>
      cancelWarehouseTransferApi(payload.id, { cancelReason: payload.cancelReason }),
    onSuccess: () => {
      dispatchToast("success", "Huỷ phiếu luân chuyển thành công!");
      setCancelModalOpen(false);
      setCancelReason("");
      setCancelRecord(null);
      refetch();
    },
    onError: (e: any) => {
      dispatchToast("error", e?.response?.data?.message || "Huỷ phiếu luân chuyển thất bại!");
    },
  });

  const openCancelModal = useCallback((record: any) => {
    setCancelRecord(record);
    setCancelReason("");
    setCancelModalOpen(true);
  }, []);

  const confirmCancel = useCallback(() => {
    if (!cancelRecord?.id) return;
    cancelMutate({ id: cancelRecord.id, cancelReason: cancelReason?.trim() || undefined });
  }, [cancelMutate, cancelReason, cancelRecord?.id]);

  const columns: ColumnsType = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "id",
        key: "id",
        render: (_: any, __: any, index: number) => index + 1,
        align: "center",
        width: 80,
      },
      {
        title: "Mã phiếu",
        dataIndex: "code",
        key: "code",
        align: "center",
        render: (_: any, record: any) => record?.code || record?.id,
      },
      {
        title: "Kho nguồn",
        dataIndex: "sourceWarehouse",
        key: "sourceWarehouse",
        align: "center",
        render: (w: any) => w?.name || "",
      },
      {
        title: "Kho đích",
        dataIndex: "destinationWarehouse",
        key: "destinationWarehouse",
        align: "center",
        render: (w: any) => w?.name || "",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (value: string) => {
          const v = String(value || "").toUpperCase();
          const color = v === "COMPLETED" ? "green" : v === "CANCELLED" ? "red" : v === "APPROVED" ? "blue" : "orange";
          return <Tag color={color}>{v || ""}</Tag>;
        },
      },
      {
        title: "Người tạo",
        dataIndex: "createdBy",
        key: "createdBy",
        align: "center",
        render: (u: any) => u?.name || u?.email || "",
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        render: (v: any) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : ""),
      },
      {
        title: "Tuỳ chọn",
        dataIndex: "",
        key: "action",
        align: "center",
        render: (_: any, record: any) => {
          const statusValue = String(record?.status || "").toUpperCase();
          const isPending = statusValue === "PENDING";
          const createdById = record?.createdBy?.id || record?.createdBy?._id;
          const isCreator = Boolean(createdById && currentUserId && createdById === currentUserId);

          const canApprove = isPending && isManager && !isCreator;
          const canCancel = isPending && (isManager || isCreator);

          return (
            <Flex vertical={false} gap={10} justify="center" style={{ cursor: "pointer" }}>
              <Tag
                color={"blue"}
                variant={"outlined"}
                onClick={() => navigate(AppRoutes.warehouse_transfer_detail, { state: { id: record?.id } })}
              >
                Chi tiết
              </Tag>

              <Popconfirm
                title="Xác nhận duyệt phiếu luân chuyển?"
                cancelText="Huỷ"
                okText="Xác nhận"
                onConfirm={() => approveMutate(record?.id)}
                disabled={!canApprove}
              >
                <Tag color={"green"} variant={"outlined"} disabled={!canApprove || approving}>
                  Duyệt
                </Tag>
              </Popconfirm>

              <Tag
                color={"red"}
                variant={"outlined"}
                disabled={!canCancel || canceling}
                onClick={() => (canCancel ? openCancelModal(record) : null)}
              >
                Huỷ
              </Tag>
            </Flex>
          );
        },
      },
    ],
    [approveMutate, approving, canceling, currentUserId, isManager, navigate, openCancelModal],
  );

  if (!canView) return <NoPermissonPage />;

  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.warehouse_transfer,
            title: (
              <>
                <UserOutlined />
                <span>Luân chuyển kho</span>
              </>
            ),
          },
        ]}
      />

      <Flex wrap="wrap" justify="space-between" gap={8}>
        <Flex wrap="wrap" gap={8}>
          <Select
            style={{ width: 220 }}
            placeholder="Lọc trạng thái"
            allowClear
            value={status}
            onChange={(v) => {
              setPage(1);
              setStatus(v || undefined);
            }}
            options={[
              { value: "PENDING", label: "PENDING" },
              { value: "APPROVED", label: "APPROVED" },
              { value: "COMPLETED", label: "COMPLETED" },
              { value: "CANCELLED", label: "CANCELLED" },
            ]}
          />
        </Flex>

        <Button
          type="primary"
          disabled={!canCreate}
          onClick={() => navigate(AppRoutes.warehouse_transfer_detail, { state: { mode: "create" } })}
        >
          Tạo phiếu luân chuyển
        </Button>
      </Flex>

      <TableCommon columns={columns} dataSource={transfers} loading={isFetching} />

      <Pagination
        current={page}
        pageSize={limit}
        total={data?.totalResults || 0}
        showSizeChanger
        onChange={(p, ps) => {
          setPage(p);
          setLimit(ps);
        }}
      />

      <Modal
        title="Huỷ phiếu luân chuyển"
        open={cancelModalOpen}
        onOk={confirmCancel}
        confirmLoading={canceling}
        okText="Xác nhận"
        cancelText="Đóng"
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
          setCancelRecord(null);
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>Phiếu:</div>
          <div>{cancelRecord?.code || cancelRecord?.id || ""}</div>
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Lý do huỷ (tuỳ chọn)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
});

export default WarehouseTransferPage;
