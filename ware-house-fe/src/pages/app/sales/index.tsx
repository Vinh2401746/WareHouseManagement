import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dispatchToast from "../../../constants/toast";
import {
  DownloadOutlined,
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
import { getInvoicesApi } from "../../../api/sales";
//['PENDING', 'COMPLETED', 'CANCELED']
const renderStatus = (status: string) => {
  switch (status) {
    case "PENDING":

      return 'Đang chờ duyệt';
    case "COMPLETED":

      return 'Đã duyệt';

    case "CANCELED":

      return 'Đã đóng';

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

  console.log("data",data)
  const { isManager, canView } = usePermission("inventoryTransactions")


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
    (type: "delete" | "update" | "reset-pass" | "approval" | "cancel", record: any) => {
      switch (type) {
        case "delete":
          mutate({ warehouseId: record.id } as DeleteWarehouseRequestType);
          break;
        case "update":
          // dispatchToast("warning", "Tính năng đang phát triển")
          // formRef.current?.show(record);
          navigate(AppRoutes.warehouse_import_export_detail, {
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
      // {
      //   title: "Loại",
      //   dataIndex: "type",
      //   key: "type",
      //   align: "center",
      //   render: (record) => record  == "IMPORT" ? "Nhập" : "Xuất",
      // },
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
    [onAction],
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
      <Flex justify="end" gap={8}>
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
              navigate(AppRoutes.warehouse_import_export_detail, {
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
    </div>
  );
});
export default SalePage;
