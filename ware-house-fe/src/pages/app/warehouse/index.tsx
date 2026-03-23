import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKeys } from "../../../constants/query-keys";
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
import type { UnitFormRef } from "./components/create-update-warehouse";
import UnitFormModal from "./components/create-update-warehouse";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import './index.css'
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";


import type { GetCategoriesRequestType } from "../../../types/category";

import { getWarehousesApi,deleteWarehouseApi } from "../../../api/warehouse";
import type { DeleteWarehouseRequestType } from "../../../types/warehouse";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
 const WarehousePage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<UnitFormRef>(null);
  const { data, isLoading, refetch, error, isError } = useQuery({
    queryKey: [QueryKeys.warehouse.list, { page, limit }],
    queryFn: ({ queryKey }) => {
    const [, payload] = queryKey as [string, GetCategoriesRequestType];
    return getWarehousesApi(payload);
  },
    gcTime: 15 * 60 * 1000 // 15 phut cache
  });
    const {isManager,canView} = usePermission("warehouses")

  useEffect(()=>{
    if(isError){
      console.log(error)
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: DeleteWarehouseRequestType) => deleteWarehouseApi(payload),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Xoá kho thành công!");
      refetch()
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
          mutate({ warehouseId: record.id  } as DeleteWarehouseRequestType);
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

  const columns: ColumnsType = useMemo(() =>[
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 80,
    },
    {
      title: "Chi Nhánh",
      dataIndex: "branch",
      key: "branch",
      align: "center",
      render: (record) => record?.name || ''
    },
    {
      title: "Tên Kho",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
        {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
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
              onClick={() => onAction("update", record)}    disabled={!isManager}
            >
              Cập nhật
            </Tag>
            <Popconfirm
              title="Xác nhận xoá đơn vị này?"
              cancelText="Huỷ"
              okText="Xác nhận"
              onConfirm={() => onAction("delete", record)}
            >
              <Tag color={"red"} variant={"outlined"}    disabled={!isManager}>
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
    <div style={{ rowGap: 24,  display: "flex",flexDirection:'column'}}>
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
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}    disabled={!isManager}>
          Thêm kho
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
      <UnitFormModal onSuccessModal={() =>{ refetch()}} ref={formRef} />
    </div>
  );
});
export default WarehousePage