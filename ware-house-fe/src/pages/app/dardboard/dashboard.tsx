import { Card, Col, Flex, Row} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "./components/StatCard";
import { TransactionItem } from "./components/TransactionItem";



const lineData = [
  { time: "00:00", deposit: 800, withdraw: 500, invest: 300 },
  { time: "06:00", deposit: 600, withdraw: 400, invest: 200 },
  { time: "12:00", deposit: 700, withdraw: 300, invest: 250 },
  { time: "18:00", deposit: 900, withdraw: 450, invest: 350 },
  { time: "23:00", deposit: 850, withdraw: 400, invest: 300 },
];

const pieData = [
  { name: "Cá khô L1", value: 35 },
  { name: "Bánh kem", value: 20 },
  { name: "Rau cải", value: 15 },
  { name: "Còn lại", value: 30 },
];

const COLORS = ["#ff4d4f", "#faad14", "#13c2c2", "#ff7875"];

export const DashBoardPage = () => {
  return (
    <Flex vertical gap={24}>
      <Row gutter={[16, 16]}>
        <StatCard title="Tổng cửa hàng" value={1250} up />
        <StatCard title="Đã xuất kho" value={820} />
        <StatCard title="Chưa xuất kho" value={430} />
        <StatCard title="Tổng doanh thu tháng" value="125.000.000 VNĐ" down />

        <StatCard title="Công nợ" value="45.000.000 VNĐ" up />
        <StatCard title="Tổng giá trị tồn kho" value="150.000.000 VNĐ" up />
        <StatCard title="Số dư cuối kỳ" value="250.000.000 VNĐ" down />
        <StatCard title="Vòng quay tồn kho" value="250" />
      </Row>
      <Row gutter={16}>
        <Col span={14}>
          <Card title="Biểu đồ dòng tiền">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="deposit" stroke="#52c41a" />
                <Line type="monotone" dataKey="withdraw" stroke="#ff4d4f" />
                <Line type="monotone" dataKey="invest" stroke="#1677ff" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Phân bổ sản phẩm">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Giao dịch mới" extra={<a>Xem tất cả</a>}>
            <TransactionItem name="Xuất hoá đơn 1" value="-5.000.000" />
            <TransactionItem name="Xuất hoá đơn 2" value="+5.000.000" />
            <TransactionItem name="Xuất hoá đơn 3" value="+5.000.000" />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Công nợ" extra={<a>Xem tất cả</a>}>
            <TransactionItem name="Nhà cung cấp 1" value="1.200.000" red />
            <TransactionItem name="Nhà cung cấp 2" value="2.400.000" red />
            <TransactionItem name="Nhà cung cấp 3" value="4.800.000" red />
          </Card>
        </Col>
      </Row>
    </Flex>
  );
};