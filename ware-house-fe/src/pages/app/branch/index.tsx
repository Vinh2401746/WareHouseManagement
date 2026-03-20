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
import type { BranchFormRef } from "./components/create-update-branch";
import BranchFormModal from "./components/create-update-branch";
import dispatchToast from "../../../constants/toast";
import { UserOutlined } from "@ant-design/icons";
import './index.css'
import { TableCommon } from "../../../components/table/table";
import { AppRoutes } from "../../../router/routes";

import type { GetCategoriesRequestType } from "../../../types/category";
import { deleteBranchApi, getBranchsApi } from "../../../api/branch";
import { usePermission } from "../../../hooks/usePermission";
import NoPermissonPage from "../../404-developing/no-permission";
 const BranchPage = memo(() => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formRef = useRef<BranchFormRef>(null);
  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: [QueryKeys.branch.list, {page, limit}],
    queryFn: ({ queryKey }) => {
    const [, payload] = queryKey as [string, GetCategoriesRequestType];
    return getBranchsApi(payload);
  },
    gcTime: 15 * 60 * 1000 // 15 phut cache
  });
    const {isManager,canView} = usePermission("branches")
    useEffect(()=>{
    if(isError){
      dispatchToast("error", error.message)
    }
  },[error, isError])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { id: string }) => deleteBranchApi({ branchId: payload.id }),
    onSuccess: () => {
      dispatchToast("success", "Xoá Chi nhánh thành công!");
      refetch()
    },
    onError: () => {
      dispatchToast("error", "Xoá Chi nhánh thất bại!");
    },
  });

  const branchs = useMemo(() => data?.results ?? [], [data?.results]);

  const onAction = useCallback(
    (type: "delete" | "update" | "reset-pass", record: any) => {
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
      title: "Tên cửa hàng",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
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
              onClick={() => onAction("update", record)}
            >
              Cập nhật
            </Tag>
            <Popconfirm
              title="Xác nhận xoá chi nhánh này?"
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
    <div style={{ rowGap: 24,  display: "flex",flexDirection:'column'}}>
      <Breadcrumb
        items={[
          {
            href: AppRoutes.branch.list,
            title: (
              <>
                <UserOutlined />
                <span>Chi nhánh</span>
              </>
            ),
          },
        ]}
      />
      <Flex justify="end">
        <Button type="primary" onClick={() => formRef.current?.show()}>
          Thêm chi nhánh
        </Button>
      </Flex>
      <TableCommon
        size="middle"
        dataSource={branchs}
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
      <BranchFormModal ref={formRef} onSuccess={()=>refetch()} />
    </div>
  );
});
export default BranchPage