import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Flex, Pagination, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UnitFormRef } from "./components/create-update-warehouse-im-ex";
import UnitFormModal from "./components/create-update-warehouse-im-ex";
import dispatchToast from "../../../constants/toast";
import {
  DownloadOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";

import type { GetInventoriesRequest } from "../../../types/inventory";

import {  deleteWarehouseApi } from "../../../api/warehouse";
import type { DeleteWarehouseRequestType } from "../../../types/warehouse";
import { getInventoriesApi } from "../../../api/inventory/inventory";
import { formatDate } from "../../../utils/helper";
const WarehouseImportAndExport = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
    const formRef = useRef<UnitFormRef>(null);
  const { data, isLoading, refetch, error, isError } = useQuery({
    queryKey: [QueryKeys.category.list, { page, limit }],
    queryFn: ({ queryKey }) => {
      const [, payload] = queryKey as [string, GetInventoriesRequest];
      return getInventoriesApi(payload);
    },
    gcTime: 15 * 60 * 1000, // 15 phut cache
  });

  console.log("data", data);

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
      dispatchToast("success", "Xoá kho thành công!");
      refetch();
    },
    onError: () => {
      dispatchToast("error", "Xoá kho thất bại!");
    },
  });

  const units = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass", record: any) => {
      switch (type) {
        case "delete":
          mutate({ warehouseId: record.id } as DeleteWarehouseRequestType);
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
        render: (record) => record  == "IMPORT" ? "Nhập" : "Xuất",
      },
      {
        title: "Tên Kho",
        dataIndex: "warehouse",
        key: "warehouse",
        align: "center",
        render:(record) => record?.name + " - " + record?.address
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
        render:(record) => record?.name + " - " + record?.email
      },
          {
        title: "Người chuyển",
        dataIndex: "deliveryPerson",
        key: "deliveryPerson",
        align: "center",
      },
           {
        title: "Ngày tạo",
        dataIndex: "transactionDate",
        key: "transactionDate",
        align: "center",
        render:(record) => formatDate(record)
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
                Xem mặt hàng
              </Tag>
              <Tag
                color={"green"}
                variant={"outlined"}
                onClick={() => onAction("update", record)}
              >
                Cập nhật
              </Tag>
              <Popconfirm
                title="Xác nhận xoá đơn vị này?"
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

  return (
    <div style={{ rowGap: 24, display: "flex", flexDirection: "column" }}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.warehouse.list,
            title: (
              <>
                <UserOutlined />
                <span>Kho</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end" gap={8}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => formRef.current?.show({})}
        >
          Nhập kho
        </Button>
        <Button
          type="primary"
          icon={<UploadOutlined />}
         onClick={() => formRef.current?.show({})}
        >
          Xuất kho
        </Button>
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
                formRef.current?.show({ ...record });
            },
          };
        }}
        // scroll={{ y: 500 }}
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
      <UnitFormModal onSuccessModal={() =>{ refetch()}} ref={formRef} />
    </div>
  );
});
export default WarehouseImportAndExport;
