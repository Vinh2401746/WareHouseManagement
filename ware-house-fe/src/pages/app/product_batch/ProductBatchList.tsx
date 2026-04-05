import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, message, Modal, Tag, Tooltip, Form, Input, Select, Card } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EditOutlined, InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getProductBatchesApi, updateProductBatchApi } from "../../../api/productBatch";
import type { ProductBatchType, GetBatchesParams } from "../../../api/productBatch";
import { formatNumber } from "../../../utils/helper";

const ProductBatchList: React.FC = () => {
  const [data, setData] = useState<ProductBatchType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [queryParams, setQueryParams] = useState<GetBatchesParams>({
    page: 1,
    limit: 10,
    stockStatus: 'AVAILABLE'
  });

  const [form] = Form.useForm();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<ProductBatchType | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<dayjs.Dayjs | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async (params: GetBatchesParams) => {
    setLoading(true);
    try {
      const res = await getProductBatchesApi(params);
      setData(res.results);
      setTotal(res.totalResults);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách lô hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(queryParams);
  }, [queryParams]);

  const onSearch = (values: Record<string, string>) => {
    setQueryParams({
      ...queryParams,
      page: 1, 
      keyword: values.keyword,
      status: values.status as GetBatchesParams['status'],
      stockStatus: values.stockStatus as GetBatchesParams['stockStatus'],
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    });
  };

  const handleEditClick = (record: ProductBatchType) => {
    setCurrentBatch(record);
    setNewExpiryDate(dayjs(record.expiryDate));
    setModalVisible(true);
  };

  const submitUpdateExpiry = async () => {
    if (!currentBatch || !newExpiryDate) return;
    setUpdating(true);
    try {
      await updateProductBatchApi(currentBatch.id, { expiryDate: newExpiryDate.toISOString() });
      message.success("Cập nhật ngày hết hạn thành công");
      setModalVisible(false);
      fetchData(queryParams);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        message.error("Bạn không có quyền cập nhật lô hàng");
      } else {
        message.error("Đã xảy ra lỗi khi cập nhật hệ thống");
      }
    } finally {
      setUpdating(false);
    }
  };

  const getStatusTag = (dateString: string, quantity: number) => {
    if (quantity <= 0) return <Tag color="default">Đã xuất hết</Tag>;
    const now = dayjs();
    const expiry = dayjs(dateString);
    if (expiry.isBefore(now)) return <Tag color="error">Đã Hết Hạn</Tag>;
    if (expiry.diff(now, 'day') <= 30) return <Tag color="warning">Sắp Hết Hạn</Tag>;
    return <Tag color="success">Còn Hạn</Tag>;
  };

  const columns: ColumnsType<ProductBatchType> = [
    {
      title: "Sản phẩm (Lô)",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.product?.name || 'Sản phẩm không rõ'}</div>
          <div style={{ fontSize: 12, color: 'gray' }}>Mã Lô: <b>{record.batchCode}</b> | SP: {record.product?.code}</div>
        </div>
      ),
    },
    {
      title: "Kho chứa",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (_, record) => record.warehouse?.name || 'N/A',
    },
    {
      title: "Tồn thực tế",
      dataIndex: "quantity",
      key: "quantity",
      align: 'right',
      render: (val: number) => <span style={{ fontWeight: 'bold' }}>{formatNumber(val)}</span>,
    },
    {
      title: "Hạn sử dụng (Date)",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{dayjs(record.expiryDate).format("DD/MM/YYYY")}</span>
          {getStatusTag(record.expiryDate, record.quantity)}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Tooltip title="Sửa hạn sử dụng (Dành cho Admin)">
          <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleEditClick(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card 
      title={<h2 style={{margin: 0}}>Quản lý Lô Hàng tổng hợp</h2>}
      bordered={false}
    >
      <Form
        form={form}
        layout="inline"
        onFinish={onSearch}
        initialValues={{ stockStatus: 'AVAILABLE', status: '' }}
        style={{ marginBottom: 24, gap: '12px' }}
      >
        <Form.Item name="keyword" style={{ width: 250 }}>
          <Input placeholder="Tìm mã lô hoặc tên sản phẩm..." allowClear />
        </Form.Item>

        <Form.Item name="status" style={{ width: 200 }}>
          <Select placeholder="Phân loại HSD" allowClear>
            <Select.Option value="">Tất cả trạng thái Date</Select.Option>
            <Select.Option value="VALID">Bình thường</Select.Option>
            <Select.Option value="EXPIRING">Cận Date ({"<="} 30đ)</Select.Option>
            <Select.Option value="EXPIRED">Đã quá hạn (Hết Hạn)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="stockStatus" style={{ width: 200 }}>
          <Select>
            <Select.Option value="AVAILABLE">Còn hàng tồn trong kho ({">"}0)</Select.Option>
            <Select.Option value="EMPTY">Lô đã xuất cạn kiệt ({"<="}0)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Tìm kiếm
          </Button>
        </Form.Item>
      </Form>

      <Table<ProductBatchType>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Cập nhật Hạn Sử Dụng (Theo Lô)"
        open={modalVisible}
        onOk={submitUpdateExpiry}
        confirmLoading={updating}
        onCancel={() => setModalVisible(false)}
      >
        <p>Lô hàng: <b>{currentBatch?.batchCode}</b></p>
        <p>Sản phẩm: <b>{currentBatch?.product?.name}</b></p>
        <div style={{ marginTop: 16 }}>
          <span>Hạn sử dụng mới: <Tooltip title="Lưu ý: Thay đổi mốc Date này sẽ ảnh hưởng tới logic nghiệp vụ POS Sale"><InfoCircleOutlined /></Tooltip> </span>
          <br />
          <DatePicker 
            value={newExpiryDate} 
            onChange={(date) => setNewExpiryDate(date)} 
            format="DD/MM/YYYY" 
            style={{ width: '100%', marginTop: 8 }} 
          />
        </div>
      </Modal>
    </Card>
  );
};

export default ProductBatchList;
