import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Modal, Pagination, Popconfirm, Spin, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dispatchToast from "../../../constants/toast";
import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";


import { deleteWarehouseApi } from "../../../api/warehouse";
import type { DeleteWarehouseRequestType } from "../../../types/warehouse";
import {  comfirmInventoryApi } from "../../../api/inventory/inventory";
import { formatDate, formatNumber } from "../../../utils/helper";

import NoPermissonPage from "../../404-developing/no-permission";
import { usePermission } from "../../../hooks/usePermission";
import { useNavigate } from "react-router-dom";
import { getInvoiceByIdApi, getInvoicesApi } from "../../../api/sales";
import { InvoiceA4 } from "./components/invoice_a4";
import { exportInvoicePdf } from "./utils/export_invoice_pdf";
//['PENDING', 'COMPLETED', 'CANCELED']
const renderStatus = (status: string) => {
  switch (status) {
    case "DRAFT":
      return 'Lưu nháp';
    case "PENDING":
      return 'Đang chờ duyệt';
    case "COMPLETED":
      return 'Hoàn thành';
    case "CANCELLED":
    case "CANCELED":
      return 'Đã huỷ';
    default:
      return 'Không xác định';
  }
}
const SalePage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate()
  const { data, isLoading, refetch, error, isError } = useQuery({
    queryKey: [QueryKeys.sales.list, { page, limit }],
    queryFn: () => {
      return getInvoicesApi({ page, limit });
    },
    gcTime: 15 * 60 * 1000, // 15 phut cache
    // enabled:false
  });

  const { isManager, canView } = usePermission("sales")

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSaleId, setPreviewSaleId] = useState<string | null>(null);
  const [exportingSaleId, setExportingSaleId] = useState<string | null>(null);
  const [exportSaleDetail, setExportSaleDetail] = useState<any | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const { data: saleDetail, isFetching: isFetchingSaleDetail } = useQuery({
    queryKey: [QueryKeys.sales.detail, previewSaleId],
    queryFn: () => getInvoiceByIdApi({ id: previewSaleId || "" }),
    enabled: Boolean(isPreviewOpen && previewSaleId),
    gcTime: 15 * 60 * 1000,
  });

  const saleDetailQrText = useMemo(() => {
    if (!saleDetail) return "";
    const code = saleDetail?.code || saleDetail?.id || "";
    const total = formatNumber(saleDetail?.totalAmountAfterFax ?? 0);
    const date = saleDetail?.saleDate ? formatDate(saleDetail.saleDate) : "";
    return `Mã HĐ: ${code} | Tổng phải thu: ${total} | Ngày bán: ${date}`;
  }, [saleDetail]);


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

  const runExport = useCallback(
    async (detail: any) => {
      const filename = `HoaDon_${detail?.code || detail?.id || "invoice"}.pdf`;
      setExportSaleDetail(detail);

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      if (!exportRef.current) {
        setExportSaleDetail(null);
        throw new Error("Không tìm thấy DOM để export PDF");
      }

      await exportInvoicePdf({ element: exportRef.current, filename });
      setExportSaleDetail(null);
    },
    [],
  );

  const onPreview = useCallback((record: any) => {
    setPreviewSaleId(record?.id);
    setIsPreviewOpen(true);
  }, []);

  const onDownloadPdf = useCallback(
    async (record: any) => {
      try {
        const saleId = record?.id;
        if (!saleId) return;
        setExportingSaleId(saleId);
        const detail = await getInvoiceByIdApi({ id: saleId });
        await runExport(detail);
      } catch (err: any) {
        dispatchToast("error", err?.message || "Tải PDF thất bại");
      } finally {
        setExportingSaleId(null);
      }
    },
    [runExport],
  );

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass" | "approval" | "cancel", record: any) => {
      switch (type) {
        case "delete":
          mutate({ warehouseId: record.id } as DeleteWarehouseRequestType);
          break;
        case "update":
          // dispatchToast("warning", "Tính năng đang phát triển")
          // formRef.current?.show(record);
          navigate(AppRoutes.sales_invoice_detail, {
            state: record
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
          if (record.status === "PENDING") {
            //call api ccael
            // mutateCancel({id:record})
            return;
          }
          dispatchToast("info", "Không thể huỷ đơn này do đã duyệt.")
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
        title: "Tên Kho",
        dataIndex: "warehouse",
        key: "warehouse",
        align: "center",
        render: (record) => record?.name
      },
      {
        title: "Khách hàng",
        dataIndex: "customerName",
        key: "customerName",
        align: "center",
        render: (val, record) => record.customer ? record.customer.name : val || 'Khách vãng lai'
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (record) => renderStatus(record)
      },
      {
        title: "Người tạo",
        dataIndex: "createdBy",
        key: "createdBy",
        align: "center",
        render: (record) => record?.email
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
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
        title: "Tổng phải thu",
        dataIndex: "totalAmountAfterFax",
        key: "totalAmountAfterFax",
        align: "center",
        render: (record) => formatNumber(record) + ' đ'
      },
      {
        title: "Ngày tạo",
        dataIndex: "transactionDate",
        key: "transactionDate",
        align: "center",
        render: (record) => formatDate(record)
      },
      {
        title: "Tuỳ chọn",
        dataIndex: "",
        key: "",
        align: "center",
        width: 350,
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
                color={"cyan"}
                variant={"outlined"}
                onClick={() => onPreview(record)}
                disabled={!canView}
                icon={<EyeOutlined />}
              >
                Xem trước
              </Tag>

              <Tag
                color={"geekblue"}
                variant={"outlined"}
                onClick={() => onDownloadPdf(record)}
                disabled={!canView || exportingSaleId === record?.id}
                icon={<DownloadOutlined />}
              >
                {exportingSaleId === record?.id ? "Đang xử lý..." : "Tải PDF"}
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
    [canView, exportingSaleId, isManager, onAction, onDownloadPdf, onPreview],
  );
  if (!canView) return <NoPermissonPage />
  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.warehouse.list,
            title: (
              <>
                <UserOutlined />
                <span>Bán hàng</span>
              </>
            ),
          },
        ]}
      />
      <Flex wrap="wrap" justify="end" gap={8}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => {
            // formRef.current?.show({})
            navigate(AppRoutes.create_invoice)
          }}
          disabled={!isManager}
        >
          Tạo đơn
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
              navigate(AppRoutes.sales_invoice_detail, {
                state: record
              })
            },
          };
        }}
        scroll={{ y: 1000 }}
      />
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

      <Modal
        open={isPreviewOpen}
        onCancel={() => {
          setIsPreviewOpen(false);
          setPreviewSaleId(null);
        }}
        width={900}
        title="Xem trước hóa đơn (A4)"
        footer={
          <Flex justify="end" gap={8}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  if (!saleDetail) return;
                  setExportingSaleId(saleDetail?.id || previewSaleId);
                  await runExport(saleDetail);
                } catch (err: any) {
                  dispatchToast("error", err?.message || "Tải PDF thất bại");
                } finally {
                  setExportingSaleId(null);
                }
              }}
              disabled={!saleDetail || isFetchingSaleDetail}
              loading={Boolean(exportingSaleId && exportingSaleId === (saleDetail?.id || previewSaleId))}
            >
              Tải xuống (PDF)
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewSaleId(null);
              }}
            >
              Đóng
            </Button>
          </Flex>
        }
      >
        <Spin spinning={isFetchingSaleDetail}>
          {saleDetail ? (
            <div style={{ overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <InvoiceA4
                  saleDetail={saleDetail}
                  qrText={saleDetailQrText}
                  showWatermark={saleDetail?.status === "CANCELLED"}
                />
              </div>
            </div>
          ) : null}
        </Spin>
      </Modal>

      {/* Offscreen render for PDF export (unscaled) */}
      {exportSaleDetail ? (
        <div style={{ position: "fixed", left: -100000, top: 0 }}>
          <InvoiceA4
            ref={exportRef}
            saleDetail={exportSaleDetail}
            qrText={`Mã HĐ: ${exportSaleDetail?.code || exportSaleDetail?.id || ""} | Tổng phải thu: ${formatNumber(exportSaleDetail?.totalAmountAfterFax ?? 0)} | Ngày bán: ${exportSaleDetail?.saleDate ? formatDate(exportSaleDetail.saleDate) : ""}`}
            showWatermark={exportSaleDetail?.status === "CANCELLED"}
          />
        </div>
      ) : null}
    </div>
  );
});
export default SalePage;
