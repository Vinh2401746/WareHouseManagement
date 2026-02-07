import { memo, useCallback, useMemo, useRef, useState } from "react";
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
import type { UnitFormRef } from "./components/create-update-unit";
import UnitFormModal from "./components/create-update-unit";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import './index.css'
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";


import type { GetCategoriesRequestType } from "../../../types/category";
import { getUnitApi, deleteUnit } from "../../../api/unit";
import type { DeleteUnitType } from "../../../types/unit";
export const UnitPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<UnitFormRef>(null);
  const { data, isLoading, refetch } = useQuery({
    queryKey: [QueryKeys.category.list, page, limit],
    queryFn: ({ queryKey }) => {
    const [, payload] = queryKey as [string, GetCategoriesRequestType];
    return getUnitApi(payload);
  },
    gcTime: 15 * 60 * 1000 // 15 phut cache
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: DeleteUnitType) => deleteUnit(payload),
    onSuccess: () => {
      console.log("data");
      dispatchToast("success", "Xoá đơn vị thành công!");
      refetch()
    },
    onError: () => {
      dispatchToast("error", "Xoá đơn vị thất bại!");
    },
  });

  const categories = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass", record: any) => {
      switch (type) {
        case "delete":
          mutate({ unitId: record.id  } as DeleteUnitType);
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
      title: "Mã đơn vị",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Tên Đơn Vị",
      dataIndex: "name",
      key: "name",
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
    }
  ],[onAction]);

  return (
    <div style={{ rowGap: 24,  display: "flex",flexDirection:'column'}}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.category,
            title: (
              <>
                <UserOutlined />
                <span>Đơn vị</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm đơn vị
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={categories}
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
      <UnitFormModal ref={formRef} />
    </div>
  );
});
