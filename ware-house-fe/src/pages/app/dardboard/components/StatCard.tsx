import { ArrowDownOutlined, ArrowUpOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Col, Statistic, Tag } from "antd";

export const StatCard = ({
  title,
  value,
  up,
  down,
}: {
  title: string;
  value: any;
  up?: boolean;
  down?: boolean;
}) => (
  <Col span={6}>
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={<UserOutlined />}
      />
      {up && (
        <Tag color="green" icon={<ArrowUpOutlined />}>
          Tăng 12.5%
        </Tag>
      )}
      {down && (
        <Tag color="red" icon={<ArrowDownOutlined />}>
          Giảm 10.5%
        </Tag>
      )}
    </Card>
  </Col>
);
