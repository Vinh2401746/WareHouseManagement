import { Card, Col, Flex, Row, Spin, DatePicker, Empty } from "antd";
import { AppstoreOutlined, ImportOutlined, ExportOutlined, WarningOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../../router/routes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "./components/StatCard";
import { TransactionItem } from "./components/TransactionItem";
import { useEffect, useState, useMemo } from "react";
import { getDashboardOverviewApi, type DashboardOverviewResponse } from "../../../api/dashboard";
import dayjs from "dayjs";
import { formatNumber } from "../../../utils/helper";

const { RangePicker } = DatePicker;

const DashBoardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getDashboardOverviewApi({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateRange]);

  const chartData = useMemo(() => {
    if (!data || !dateRange || !dateRange[0] || !dateRange[1]) return [];

    const dataMap = new Map();
    data.charts.dates.forEach((dateStr, index) => {
      if (dateStr) {
        dataMap.set(String(dateStr), {
          import: data.charts.importData[index] || 0,
          export: data.charts.exportData[index] || 0,
        });
      }
    });

    const result = [];
    let current = dayjs(dateRange[0]).startOf('day');
    const end = dayjs(dateRange[1]).startOf('day');

    while (current.valueOf() <= end.valueOf()) {
      const dateStr = current.format('YYYY-MM-DD');
      const timeLabel = current.format('MM-DD');
      const existing = dataMap.get(dateStr);

      result.push({
        time: timeLabel,
        import: existing ? existing.import : 0,
        export: existing ? existing.export : 0,
      });
      
      current = current.add(1, 'day');
    }

    return result;
  }, [data, dateRange]);

  return (
    <Flex vertical gap={24} style={{ minHeight: "80vh" }}>
      <Flex justify="space-between" align="center">
        <h2 style={{ margin: 0 }}>Tổng quan Kho hàng</h2>
        <RangePicker 
          value={dateRange} 
          onChange={(dates) => dates && setDateRange([dates[0] as dayjs.Dayjs, dates[1] as dayjs.Dayjs])} 
        />
      </Flex>
      {loading && !data ? (
        <Flex justify="center" align="center" style={{ height: "50vh" }}>
          <Spin size="large" />
        </Flex>
      ) : data ? (
        <>
          <Row gutter={[16, 16]}>
            <Col span={6} xxl={6} xl={6} lg={12} md={12} sm={24} xs={24} >
              <StatCard title="Tổng số loại mặt hàng" value={formatNumber(data.kpis.totalStock)} icon={<AppstoreOutlined style={{ color: '#1677ff' }} />} />
            </Col>
            <Col span={6} xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
              <StatCard title="Phiếu nhập chờ xử lý" value={data.kpis.pendingImports} icon={<ImportOutlined style={{ color: '#52c41a' }} />} />
            </Col>
            <Col span={6} xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
              <StatCard title="Phiếu xuất chờ xử lý" value={data.kpis.pendingExports} icon={<ExportOutlined style={{ color: '#ff4d4f' }} />} />
            </Col>
            <Col span={6} xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
              <StatCard title="Sản phẩm quá định mức cạn" value={data.kpis.lowStockProductsCount} icon={<WarningOutlined style={{ color: '#faad14' }} />} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24} xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
              <Card title="Cường độ hoạt động (Nhập/Xuất kho)">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="import" name="Số lượng Nhập" stroke="#52c41a" strokeWidth={2} />
                    <Line type="monotone" dataKey="export" name="Số lượng Xuất" stroke="#ff4d4f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12} xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
              <Card title="Giao dịch kho gần nhất" extra={<Link to={AppRoutes.warehouse_import_export}>Xem sổ kho</Link>}>
                {data.recentTransactions.length > 0 ? data.recentTransactions.map((tx) => (
                  <TransactionItem 
                    key={tx.id} 
                    name={`[${tx.type === 'IMPORT' ? 'Nhập' : 'Xuất'}] - Người tạo: ${tx.createdBy}`} 
                    value={tx.totalAmount ? `Tổng GT: ${formatNumber(tx.totalAmount)}` : (tx.status === 'PENDING' ? "Chờ xử lý" : "0")} 
                    unit={tx.totalAmount ? "VNĐ" : ""}
                    color={tx.status === 'PENDING' ? '#faad14' : (tx.type === 'EXPORT' ? 'red' : 'green')}
                  />
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có giao dịch gần đây" />}
              </Card>
            </Col>

            <Col span={12} xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
              <Card title="Cảnh báo sản phẩm Cạn kho" extra={<Link to={AppRoutes.products}>Xem toàn bộ</Link>}>
                {data.lowStockAlerts.length > 0 ? data.lowStockAlerts.map((p) => (
                  <TransactionItem 
                    key={p.id} 
                    name={`[${p.code}] ${p.name}`} 
                    value={`${p.currentStock}`} 
                    unit={` Tồn dư (Mức tối thiểu: ${p.minStock})`}
                    color="red"
                  />
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Tồn kho các mặt hàng đang ở mức an toàn" />}
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
    </Flex>
  );
};

export default DashBoardPage;
