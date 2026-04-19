import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MinusOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as UUID } from "uuid";
import dayjs from "dayjs";

import { AppRoutes } from "../../../../router/routes";
import { TableCommon } from "../../../../components/table/table";
import { QueryKeys } from "../../../../constants/query-keys";
import dispatchToast from "../../../../constants/toast";
import NoPermissonPage from "../../../404-developing/no-permission";
import { usePermission } from "../../../../hooks/usePermission";
import { useAppSelector } from "../../../../store/hooks";

import { getWarehousesApi } from "../../../../api/warehouse";
import { getProductsApi } from "../../../../api/products";
import { getProductBatchesApi } from "../../../../api/productBatch";

import {
  approveWarehouseTransferApi,
  cancelWarehouseTransferApi,
  createWarehouseTransferApi,
  getWarehouseTransferByIdApi,
} from "../../../../api/warehouseTransfer";

import type { GetProductsRequestType } from "../../../../types/products";
import type { GetWarehousesRequestType } from "../../../../types/warehouse";
import type { CreateWarehouseTransferRequest } from "../../../../types/warehouseTransfer";

type TransferItemRow = {
  idPath: string;
  product: any;
  batch: any | null;
  quantity: number;
  isTemplate?: boolean;
};

const ItemTemplate: Omit<TransferItemRow, "idPath"> = {
  product: null,
  batch: null,
  quantity: 0,
  isTemplate: true,
};

type LocationState = {
  id?: string;
  mode?: "create";
};

const WarehouseTransferDetailPage = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const transferId = state?.id;
  const isCreateMode = !transferId;

  const { canView, isManager, isSuperAdmin } = usePermission("warehouseTransfers");
  const permissionMap = useAppSelector((s: any) => s.auth.permission?.permissionsByGroup);
  const currentUserId = useAppSelector((s: any) => s.user?.user?.id);

  const canCreate =
    isSuperAdmin ||
    permissionMap?.warehouseTransfers?.join("")?.includes("create") ||
    permissionMap?.warehouseTransfers?.includes("createWarehouseTransfers") ||
    false;

  const [form] = Form.useForm();

  const [itemsData, setItemsData] = useState<TransferItemRow[]>([{ ...ItemTemplate, idPath: UUID() }]);
  const [loading, setLoading] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [activeBatchQuery, setActiveBatchQuery] = useState<{ warehouseId?: string; productId?: string; rowId?: string }>({});

  const { data: warehouseData } = useQuery({
    queryKey: [QueryKeys.warehouse.list],
    queryFn: () => getWarehousesApi({ page: 1, limit: 1000000000 } as GetWarehousesRequestType),
  });

  const warehouses = useMemo(
    () =>
      warehouseData?.results?.map((w: any) => ({
        value: w.id,
        label: `${w?.name || ""}-${w?.branch?.name || ""}`,
      })) ?? [],
    [warehouseData?.results],
  );

  const { data: productData } = useQuery({
    queryKey: [QueryKeys.products.list],
    queryFn: () => getProductsApi({ page: 1, limit: 1000000000 } as GetProductsRequestType),
  });

  const products = useMemo(
    () =>
      productData?.results?.map((p: any) => ({
        ...p,
        value: p.id,
        label: `${p?.code}-${p?.name || ""}`,
      })) ?? [],
    [productData?.results],
  );

  const {
    data: transferDetail,
    isFetching: fetchingDetail,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: [QueryKeys.warehouseTransfer.detail, { id: transferId }],
    queryFn: () => getWarehouseTransferByIdApi(String(transferId)),
    enabled: Boolean(transferId),
  });

  const sourceWarehouseId = Form.useWatch("sourceWarehouse", form);

  const { data: batchData, isFetching: fetchingBatches } = useQuery({
    queryKey: [QueryKeys.warehouseTransfer.batches, activeBatchQuery],
    queryFn: () => {
      const warehouse = String(activeBatchQuery.warehouseId || "");
      const product = String(activeBatchQuery.productId || "");
      return getProductBatchesApi({
        page: 1,
        limit: 1000000000,
        warehouse,
        product,
        stockStatus: "AVAILABLE",
        status: "VALID",
      });
    },
    enabled: Boolean(activeBatchQuery.warehouseId && activeBatchQuery.productId),
  });

  const batchOptions = useMemo(() => {
    const results = batchData?.results || [];
    return results.map((b: any) => ({
      value: b.id,
      label: `${b?.batchCode || ""} | Tồn: ${b?.quantity ?? ""} | HSD: ${b?.expiryDate ? dayjs(b.expiryDate).format("DD/MM/YYYY") : ""}`,
      raw: b,
    }));
  }, [batchData?.results]);

  const statusValue = useMemo(() => String(transferDetail?.status || "").toUpperCase(), [transferDetail?.status]);
  const isPending = statusValue === "PENDING";

  const createdById = transferDetail?.createdBy?.id || transferDetail?.createdBy?._id;
  const isCreator = Boolean(createdById && currentUserId && createdById === currentUserId);

  const canApprove = Boolean(transferId && isPending && isManager && !isCreator);
  const canCancel = Boolean(transferId && isPending && (isManager || isCreator));

  const { mutate: createMutate, isPending: creating } = useMutation({
    mutationFn: (payload: CreateWarehouseTransferRequest) => createWarehouseTransferApi(payload),
    onSuccess: () => {
      dispatchToast("success", "Tạo phiếu luân chuyển thành công!");
      navigate(AppRoutes.warehouse_transfer);
    },
    onError: (e: any) => {
      dispatchToast("error", e?.response?.data?.message || "Tạo phiếu luân chuyển thất bại!");
    },
  });

  const { mutate: approveMutate, isPending: approving } = useMutation({
    mutationFn: (id: string) => approveWarehouseTransferApi(id),
    onSuccess: () => {
      dispatchToast("success", "Duyệt phiếu luân chuyển thành công!");
      refetchDetail();
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
      refetchDetail();
    },
    onError: (e: any) => {
      dispatchToast("error", e?.response?.data?.message || "Huỷ phiếu luân chuyển thất bại!");
    },
  });

  useEffect(() => {
    if (!transferId) {
      form.resetFields();
      setItemsData([{ ...ItemTemplate, idPath: UUID() }]);
      return;
    }

    if (!transferDetail?.id) return;

    setLoading(true);
    form.setFieldsValue({
      sourceWarehouse: transferDetail?.sourceWarehouse?.id || "",
      destinationWarehouse: transferDetail?.destinationWarehouse?.id || "",
      reason: transferDetail?.reason || "",
      note: transferDetail?.note || "",
    });

    setItemsData(
      transferDetail?.items?.length
        ? transferDetail.items.map((it: any) => ({
            idPath: UUID(),
            product: it?.product || null,
            batch: it?.batch || null,
            quantity: Number(it?.quantity || 0),
          }))
        : [{ ...ItemTemplate, idPath: UUID() }],
    );

    setLoading(false);
  }, [form, transferDetail?.id, transferId]);

  useEffect(() => {
    if (!isCreateMode) return;
    // reset batch selections if source warehouse changes
    setItemsData((prev) => prev.map((r) => ({ ...r, batch: null })));
    setActiveBatchQuery({});
  }, [isCreateMode, sourceWarehouseId]);

  const addRow = useCallback(() => {
    setItemsData((prev) => prev.concat([{ ...ItemTemplate, idPath: UUID() }]));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setItemsData((prev) => {
      const next = prev.filter((r) => r.idPath !== rowId);
      return next.length ? next : [{ ...ItemTemplate, idPath: UUID() }];
    });
  }, []);

  const updateRow = useCallback((rowId: string, patch: Partial<TransferItemRow>) => {
    setItemsData((prev) => prev.map((r) => (r.idPath === rowId ? { ...r, ...patch } : r)));
  }, []);

  const validateAndSubmit = useCallback(async () => {
    if (!canCreate) return;

    const values = await form.validateFields();
    const sourceWarehouse = String(values.sourceWarehouse || "");
    const destinationWarehouse = String(values.destinationWarehouse || "");

    if (!sourceWarehouse || !destinationWarehouse) {
      dispatchToast("error", "Vui lòng chọn kho nguồn và kho đích");
      return;
    }

    if (sourceWarehouse === destinationWarehouse) {
      dispatchToast("error", "Kho nguồn và kho đích không được trùng nhau");
      return;
    }

    const items = itemsData
      .filter((r) => r.product && Number(r.quantity) > 0)
      .map((r) => ({
        product: r.product?.id || r.product?.value || r.product,
        quantity: Number(r.quantity),
        batch: r.batch?.id || r.batch?.value || r.batch || null,
      }));

    if (items.length === 0) {
      dispatchToast("error", "Vui lòng nhập ít nhất 1 dòng hàng hợp lệ");
      return;
    }

    createMutate({
      sourceWarehouse,
      destinationWarehouse,
      reason: values.reason || undefined,
      note: values.note || undefined,
      items,
    });
  }, [canCreate, createMutate, form, itemsData]);

  const columns: ColumnsType<TransferItemRow> = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "idPath",
        key: "stt",
        align: "center",
        width: 70,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Sản phẩm",
        dataIndex: "product",
        key: "product",
        render: (_: any, record: TransferItemRow) => {
          if (!isCreateMode) {
            return <span>{record?.product?.name || record?.product?.code || ""}</span>;
          }

          return (
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="label"
              value={record?.product?.id || record?.product?.value || undefined}
              options={products}
              onChange={(value: any) => {
                const picked = products.find((p: any) => p.value === value);
                updateRow(record.idPath, { product: picked || null, batch: null });
              }}
            />
          );
        },
      },
      {
        title: "Lô (tuỳ chọn)",
        dataIndex: "batch",
        key: "batch",
        render: (_: any, record: TransferItemRow) => {
          if (!isCreateMode) {
            return <span>{record?.batch?.batchCode || ""}</span>;
          }

          const productId = record?.product?.id || record?.product?.value;
          const disabled = !sourceWarehouseId || !productId;
          const isThisRowActive = activeBatchQuery.rowId === record.idPath;

          return (
            <Select
              style={{ width: "100%" }}
              placeholder={disabled ? "Chọn kho nguồn + sản phẩm" : "Chọn lô (để trống = FEFO)"}
              allowClear
              loading={isThisRowActive && fetchingBatches}
              disabled={disabled}
              value={record?.batch?.id || record?.batch?.value || undefined}
              options={isThisRowActive ? batchOptions : []}
              onDropdownVisibleChange={(open) => {
                if (!open) return;
                if (!sourceWarehouseId || !productId) return;
                setActiveBatchQuery({
                  warehouseId: String(sourceWarehouseId),
                  productId: String(productId),
                  rowId: record.idPath,
                });
              }}
              onChange={(value: any) => {
                if (!value) return updateRow(record.idPath, { batch: null });
                const picked = batchOptions.find((o: any) => o.value === value);
                updateRow(record.idPath, { batch: picked?.raw || null });
              }}
            />
          );
        },
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        align: "center",
        width: 150,
        render: (v: any, record: TransferItemRow) => {
          if (!isCreateMode) return <span>{Number(v || 0)}</span>;

          return (
            <Input
              type="number"
              min={0}
              value={record.quantity}
              onChange={(e) => updateRow(record.idPath, { quantity: Number(e.target.value || 0) })}
            />
          );
        },
      },
      {
        title: "",
        dataIndex: "action",
        key: "action",
        align: "center",
        width: 70,
        render: (_: any, record: TransferItemRow) => {
          if (!isCreateMode) return null;
          return (
            <Tag color={"red"} variant={"outlined"} onClick={() => removeRow(record.idPath)}>
              <MinusOutlined />
            </Tag>
          );
        },
      },
    ],
    [
      activeBatchQuery.rowId,
      batchOptions,
      fetchingBatches,
      isCreateMode,
      products,
      removeRow,
      sourceWarehouseId,
      updateRow,
    ],
  );

  if (!canView) return <NoPermissonPage />;

  const headerRight = (
    <Flex wrap="wrap" gap={8} justify="end">
      {transferId ? (
        <>
          <Popconfirm
            title="Xác nhận duyệt phiếu luân chuyển?"
            cancelText="Huỷ"
            okText="Xác nhận"
            onConfirm={() => approveMutate(String(transferId))}
            disabled={!canApprove}
          >
            <Button type="primary" disabled={!canApprove} loading={approving}>
              Duyệt
            </Button>
          </Popconfirm>

          <Button
            danger
            disabled={!canCancel}
            loading={canceling}
            onClick={() => {
              setCancelReason("");
              setCancelModalOpen(true);
            }}
          >
            Huỷ
          </Button>
        </>
      ) : (
        <Button type="primary" disabled={!canCreate} loading={creating} onClick={validateAndSubmit}>
          Tạo phiếu
        </Button>
      )}

      <Button onClick={() => navigate(AppRoutes.warehouse_transfer)}>Quay lại</Button>
    </Flex>
  );

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
          {
            title: transferId ? "Chi tiết" : "Tạo mới",
          },
        ]}
      />

      {headerRight}

      <Spin spinning={loading || fetchingDetail}>
        {transferId && (
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={24}>
              <Flex gap={12} align="center" wrap>
                <div>
                  <b>Mã phiếu:</b> {transferDetail?.code || transferDetail?.id}
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  <Tag
                    color={
                      statusValue === "COMPLETED"
                        ? "green"
                        : statusValue === "CANCELLED"
                          ? "red"
                          : statusValue === "APPROVED"
                            ? "blue"
                            : "orange"
                    }
                  >
                    {statusValue}
                  </Tag>
                </div>
                <div>
                  <b>Người tạo:</b> {transferDetail?.createdBy?.name || transferDetail?.createdBy?.email || ""}
                </div>
                <div>
                  <b>Ngày tạo:</b> {transferDetail?.createdAt ? dayjs(transferDetail.createdAt).format("DD/MM/YYYY HH:mm") : ""}
                </div>
              </Flex>
            </Col>
          </Row>
        )}

        <Form form={form} layout="vertical" disabled={!isCreateMode}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Kho nguồn"
                name="sourceWarehouse"
                rules={[{ required: true, message: "Vui lòng chọn kho nguồn" }]}
              >
                <Select placeholder="Chọn kho nguồn" options={warehouses} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Kho đích"
                name="destinationWarehouse"
                rules={[{ required: true, message: "Vui lòng chọn kho đích" }]}
              >
                <Select
                  placeholder="Chọn kho đích"
                  options={warehouses}
                  disabled={!isCreateMode || !sourceWarehouseId}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Lý do" name="reason">
                <Input placeholder="Lý do (tuỳ chọn)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ghi chú" name="note">
                <Input placeholder="Ghi chú (tuỳ chọn)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <b>Danh sách hàng</b>
          {isCreateMode && (
            <Button onClick={addRow} icon={<PlusOutlined />}>
              Thêm dòng
            </Button>
          )}
        </Flex>

        <TableCommon columns={columns} dataSource={itemsData} rowKey="idPath" loading={fetchingBatches} />
      </Spin>

      <Modal
        title="Huỷ phiếu luân chuyển"
        open={cancelModalOpen}
        onOk={() => {
          if (!transferId) return;
          cancelMutate({ id: String(transferId), cancelReason: cancelReason?.trim() || undefined });
        }}
        confirmLoading={canceling}
        okText="Xác nhận"
        cancelText="Đóng"
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
        }}
      >
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

export default WarehouseTransferDetailPage;
