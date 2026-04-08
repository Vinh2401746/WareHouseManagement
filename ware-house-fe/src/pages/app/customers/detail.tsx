import { memo, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Descriptions, Tabs, Tag, Table, Spin, Button, Pagination, Flex } from "antd";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AppRoutes } from "../../../router/routes";
import { getCustomerByIdApi } from "../../../api/customer";
import { getInvoicesApi } from "../../../api/sales";
import { formatNumber } from "../../../utils/helper";
import type { ColumnsType } from "antd/es/table";

const CustomerDetailPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch Customer via getCustomersApi filter wait for API detail if needed, but getCustomersApi can't query by id easily unless we pass `id`?
  // Wait, the API doesn't have a getCustomerById on FE. We can fetch using customer list with name filter or just fetch all and find, but ideally we add getCustomerByIdApi?
  // Since we only have getCustomersApi, let's use it and filter locally, or we should create `getCustomerByIdApi`. 
  // Let's create getCustomerByIdApi in customer.ts! For now I'll assume we will create it and import it here.
  
  // Quick fix: I will add getCustomerByIdApi to api/customer.ts in the next step.

  const { data: customerData, isFetching: loadingCustomer } = useQuery({
    queryKey: ["customer.detail", id],
    queryFn: () => getCustomerByIdApi(id!),
    enabled: !!id,
  });

  const { data: salesData, isFetching: loadingSales } = useQuery({
    queryKey: ["sales.list", { page, limit, customer: id }],
    queryFn: () => getInvoicesApi({ page, limit, customer: id }),
    enabled: !!id,
  });

  const sales = useMemo(() => salesData?.data?.results || [], [salesData]);
  const totalSales = salesData?.data?.totalResults || 0;

  const saleColumns: ColumnsType = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Ngày bán",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kho",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (w) => w?.name || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "COMPLETED" ? "green" : status === "DRAFT" ? "orange" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val) => formatNumber(val) + " đ",
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (val) => formatNumber(val) + " đ",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Flex gap={16} align="center">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(AppRoutes.customer)}>Quay lại</Button>
        <Breadcrumb
          items={[
            {
              href: AppRoutes.customer,
              title: (
                <>
                  <UserOutlined />
                  <span>Khách hàng</span>
                </>
              ),
            },
            {
              title: customerData?.name || "Chi tiết khách hàng",
            },
          ]}
        />
      </Flex>

      {loadingCustomer ? (
        <Spin />
      ) : (
        <Card title="Thông tin khách hàng" bordered={false}>
          <Descriptions column={3}>
            <Descriptions.Item label="Mã KH">{customerData?.id?.substring(customerData?.id?.length - 6).toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Tên khách hàng">{customerData?.name}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{customerData?.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{customerData?.email || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">{typeof customerData?.branch === 'object' ? (customerData?.branch as any)?.name : customerData?.branch || "Mặc định"}</Descriptions.Item>
            <Descriptions.Item label="Tổng nợ hiện tại">
              <span style={{ color: (customerData?.totalDebt || 0) > 0 ? "red" : "green", fontWeight: "bold" }}>
                {formatNumber(customerData?.totalDebt || 0)} đ
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={3}>{customerData?.address || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={3}>{customerData?.note || "Không có ghi chú"}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="Lịch sử giao dịch" bordered={false}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Đơn bán hàng" key="1">
            <Table
              dataSource={sales}
              columns={saleColumns}
              rowKey="id"
              pagination={false}
              loading={loadingSales}
            />
            <Flex justify="end" style={{ marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={limit}
                total={totalSales}
                onChange={(p, size) => {
                  setPage(p);
                  setLimit(size);
                }}
              />
            </Flex>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
});

export default CustomerDetailPage;
