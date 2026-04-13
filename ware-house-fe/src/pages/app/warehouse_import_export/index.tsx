import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag, Modal, Spin, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dispatchToast from "../../../constants/toast";
import {
  DownloadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";

import type { GetInventoriesRequest } from "../../../types/inventory";

import { deleteWarehouseApi } from "../../../api/warehouse";
import type { DeleteWarehouseRequestType } from "../../../types/warehouse";
import { comfirmInventoryApi, getAnInventoryApi, getInventoriesApi } from "../../../api/inventory/inventory";
import { formatDate, formatNumber } from "../../../utils/helper";
import { InventoryA4 } from "./components/inventory_a4";
import { exportInventoryPdf } from "./utils/export_inventory_pdf";
import type { CancelFormRef } from "./components/cancel-import";
import CancelImport from "./components/cancel-import";
import NoPermissonPage from "../../404-developing/no-permission";
import { usePermission } from "../../../hooks/usePermission";
import { useNavigate } from "react-router-dom";
//['PENDING', 'COMPLETED', 'CANCELED']
const renderStatus = (status: string) => {
  switch (status) {
    case "PENDING":

      return 'Đang chờ duyệt';
    case "COMPLETED":

      return 'Đã duyệt';

    case "CANCELED":

      return 'Đã huỷ';

    default:
      return 'Không xác định';
  }
}
const WarehouseImportAndExport = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState<"IMPORT" | "EXPORT">("IMPORT");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingExportId, setPendingExportId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const cancelRef= useRef<CancelFormRef>(null)

  const navigate = useNavigate()
  const { data, isLoading, refetch, error, isError } = useQuery({
    queryKey: [QueryKeys.inventory.list, { page, limit, type }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetInventoriesRequest];
      return getInventoriesApi(payload);
    },
    gcTime: 15 * 60 * 1000, // 15 phut cache
    // enabled:false
  });
      const {isManager,canView} = usePermission("inventoryTransactions")

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: [QueryKeys.inventory.detail, selectedId],
    queryFn: () => getAnInventoryApi({ id: selectedId || "" }),
    enabled: Boolean(selectedId),
  });


  useEffect(() => {
    if (isError) {
      dispatchToast("error", error.message);
    }
  }, [error, isError]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: DeleteWarehouseRequestType) =>
      deleteWarehouseApi(payload),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Xoá đơn nhập kho thành công!");
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá đơn nhập kho thất bại!");
    },
  });
  // comfirmInventoryApi

  const { mutate: mutateConfirm } = useMutation({
    mutationFn: (payload: { id: string }) =>
      comfirmInventoryApi(payload),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Duyệt đơn nhập kho thành công!");
      refetch();
    },
    onError: (error) => {
      console.log("error", error)
      dispatchToast("error", "Duyệt đơn nhập kho thất bại!");
    },
  });


  const units = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (actionType: "delete" | "update" | "reset-pass" | "approval" | "cancel" | "preview" | "download", record: any) => {
      switch (actionType) {
        case "delete":
          mutate({ warehouseId: record.id } as DeleteWarehouseRequestType);
          break;
        case "update":
          // dispatchToast("warning", "Tính năng đang phát triển")
          // formRef.current?.show(record);
          navigate(AppRoutes.warehouse_import_export_detail,{
            state:record
          })
          break;
        case "approval":
          // dispatchToast("warning", "Tính năng đang phát triển")
          if (record.status === "PENDING") {
            mutateConfirm({ id: record.id || '' })
          }
          else if (record.status === "COMPLETED") {
            dispatchToast("info", "Đã duyệt đơn này")
          }
          else {
            dispatchToast("info", "Đã huỷ đơn này")
          }
          break;
        case "cancel":
          if(record.status === "PENDING") {
            //call api ccael
            // mutateCancel({id:record})
            cancelRef.current?.show(record.id)
            return;
          }
           dispatchToast("info", "Không thể huỷ đơn này do đã duyệt.")
          break;
        case "preview":
          setSelectedId(record.id || null);
          setIsPreviewOpen(true);
          break;
        case "download":
          setSelectedId(record.id || null);
          setPendingExportId(record.id || null);
          break;
        default:
          break;
      }
    },
    [mutate, mutateConfirm, navigate],
  );

  const buildFilename = useCallback((detail: any) => {
    const dateValue = detail?.transactionDate ? new Date(detail.transactionDate) : new Date();
    const dd = String(dateValue.getDate()).padStart(2, "0");
    const mm = String(dateValue.getMonth() + 1).padStart(2, "0");
    const yyyy = String(dateValue.getFullYear());
    const dateText = `${dd}${mm}${yyyy}`;
    const idText = detail?.id || detail?._id || "";
    const prefix = detail?.type === "EXPORT" ? "Phieu_Xuat" : "Phieu_Nhap";
    return `${prefix}_${dateText}_${idText}.pdf`;
  }, []);

  const handleExport = useCallback(async () => {
    if (!detailData || !exportRef.current) return;
    try {
      setIsExporting(true);
      const filename = buildFilename(detailData);
      await exportInventoryPdf({ element: exportRef.current, filename });
    } finally {
      setIsExporting(false);
    }
  }, [buildFilename, detailData]);

  useEffect(() => {
    if (!pendingExportId || !detailData || isDetailLoading) return;
    const detailId = detailData?.id || detailData?._id || "";
    if (String(detailId) !== String(pendingExportId)) return;
    handleExport();
    setPendingExportId(null);
  }, [detailData, handleExport, isDetailLoading, pendingExportId]);

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
        title: "Loại",
        dataIndex: "type",
        key: "type",
        align: "center",
        render: (record) => (record === "IMPORT" ? "Nhập" : "Xuất"),
      },
      {
        title: "Tên Kho",
        dataIndex: "warehouse",
        key: "warehouse",
        align: "center",
        render: (record) => record?.name
      },
      {
        title: "Lý do",
        dataIndex: "reason",
        key: "reason",
        align: "center",
      },
      {
        title: "Người tạo",
        dataIndex: "createdBy",
        key: "createdBy",
        align: "center",
        render: (record) => record?.email
      },
      {
        title: "Tổng tiền thanh toán",
        dataIndex: "totalAmountAfterFax",
        key: "totalAmountAfterFax",
        align: "center",
        render: (record) => formatNumber(record) + ' đ'
      },
      {
        title: "Chiết khấu",
        dataIndex: "discountMoney",
        key: "discountMoney",
        align: "center",
        render: (record) => formatNumber(record) + ' đ'
      },
      {
        title: "Tiền thuế",
        dataIndex: "taxMoney",
        key: "taxMoney",
        align: "center",
        render: (record) => formatNumber(record) + ' đ'
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "center",
        render: (record) => formatNumber(record) + ' đ'
      },
      {
        title: "Người vận chuyển",
        dataIndex: "deliveryPerson",
        key: "deliveryPerson",
        align: "center",
      },
      {
        title: "Ngày tạo",
        dataIndex: "transactionDate",
        key: "transactionDate",
        align: "center",
        render: (record) => formatDate(record)
      },
         {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (record) => renderStatus(record)
      },
      {
        title: "Tuỳ chọn",
        dataIndex: "",
        key: "",
        align: "center",
        width: 420,
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
                onClick={() => onAction("update", record)}
                   disabled={!isManager}
              >
                Chi Tiết Đơn
              </Tag>
              <Tag
                color={"geekblue"}
                variant={"outlined"}
                onClick={() => onAction("preview", record)}
              >
                Xem PDF
              </Tag>
              <Tag
                color={"cyan"}
                variant={"outlined"}
                onClick={() => onAction("download", record)}
              >
                Tải PDF
              </Tag>
           
              {
                record.status == "PENDING" &&
                <>
                  <Popconfirm title="Bạn chắc chắn muốn duyệt đơn này!" onConfirm={() => onAction("approval", record)}>
                    <Tag
                      color={"green"}
                      variant={"outlined"}
                         disabled={!isManager}
                    >
                      {renderStatus(record?.status)}
                    </Tag>

                  </Popconfirm>
                    <Popconfirm
                      title="Xác nhận huỷ đơn nhập kho này?"
                      cancelText="Huỷ"
                      okText="Xác nhận"
                      onConfirm={() => onAction("cancel", record)}
                         disabled={!isManager}
                    >
                      <Tag color={"yellow"} variant={"outlined"}>
                        Huỷ đơn
                      </Tag>
                    </Popconfirm>
                </>
              }

              <Popconfirm
                title="Xác nhận xoá đơn nhập kho này?"
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
    [isManager, onAction],
  );
  if(!canView) return <NoPermissonPage />
  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.warehouse.list,
            title: (
              <>
                <UserOutlined />
                <span>Nhập kho</span>
              </>
            ),
          },
        ]}
      />
      <Flex wrap="wrap" justify="space-between" gap={8}>
        <Select
          value={type}
          onChange={(value) => setType(value)}
          options={[
            { value: "IMPORT", label: "Nhập kho" },
            { value: "EXPORT", label: "Xuất kho" },
          ]}
          style={{ minWidth: 160 }}
        />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => {
            // formRef.current?.show({})
              navigate(AppRoutes.warehouse_import_export_detail)
        }}
             disabled={!isManager}
        >
          {type === "IMPORT" ? "Tạo đơn nhập kho" : "Tạo đơn xuất kho"}
        </Button>
        {/* <Button
          type="primary"
          icon={<UploadOutlined />}
         onClick={() => formRef.current?.show({})}
        >
          Xuất kho
        </Button> */}
      </Flex>
      <TableCommon
        size="middle"
        dataSource={units}
        columns={columns}
        pagination={false}
        loading={isLoading || isPending}
        rowKey={"id"}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              // formRef.current?.show({ ...record });
                navigate(AppRoutes.warehouse_import_export_detail,{
            state:record
          })
            },
          };
        }}
        scroll={{ y: 1000 }}
      />
      <div style={{ position: "absolute", left: -10000, top: -10000 }}>
        {detailData ? (
          <InventoryA4
            ref={exportRef}
            transactionDetail={detailData}
            qrText={window.location.origin}
            showWatermark={detailData?.status === "CANCELED"}
          />
        ) : null}
      </div>
      <Flex justify="end">
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
      <CancelImport ref={cancelRef} onSuccessModal={() => { refetch() }} />
      <Modal
        title="Xem phieu"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={920}
      >
        {isDetailLoading ? (
          <Spin />
        ) : detailData ? (
          <>
            <div style={{ maxHeight: 600, overflow: "auto" }}>
              <InventoryA4
                transactionDetail={detailData}
                qrText={window.location.origin}
                showWatermark={detailData?.status === "CANCELED"}
              />
            </div>
            <Flex justify="end" gap={12} style={{ marginTop: 12 }}>
              <Button onClick={() => setIsPreviewOpen(false)}>Dong</Button>
              <Button type="primary" loading={isExporting} onClick={handleExport}>
                Tai PDF
              </Button>
            </Flex>
          </>
        ) : null}
      </Modal>
    </div>
  );
});
export default WarehouseImportAndExport;
