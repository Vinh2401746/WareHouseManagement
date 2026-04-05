import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Statistic, Tag } from "antd";
import React from "react";

export const StatCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: any;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
}) => (

    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
      />
      {trend?.direction === "up" && (
        <Tag color="green" icon={<ArrowUpOutlined />} style={{ marginTop: 8 }}>
          {trend.label}
        </Tag>
      )}
      {trend?.direction === "down" && (
        <Tag color="red" icon={<ArrowDownOutlined />} style={{ marginTop: 8 }}>
          {trend.label}
        </Tag>
      )}
    </Card>
);
