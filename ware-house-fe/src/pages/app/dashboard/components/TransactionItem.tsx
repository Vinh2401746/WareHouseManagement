import { Flex, Typography } from "antd";
const { Text } = Typography;
export const TransactionItem = ({
  name,
  value,
  red,
}: {
  name: string;
  value: string;
  red?: boolean;
}) => (
  <Flex justify="space-between" style={{ marginBottom: 12 }}>
    <Text>{name}</Text>
    <Text style={{ color: red ? "red" : value.startsWith("-") ? "red" : "green" }}>
      {value} VNĐ
    </Text>
  </Flex>
);
