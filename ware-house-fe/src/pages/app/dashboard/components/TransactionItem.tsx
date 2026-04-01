import { Flex, Typography } from "antd";
const { Text } = Typography;
export const TransactionItem = ({
  name,
  value,
  red,
  color,
  unit,
}: {
  name: string;
  value: string;
  red?: boolean;
  color?: string;
  unit?: string;
}) => {
  let finalColor = color;
  if (!finalColor) {
    finalColor = red ? "red" : String(value).startsWith("-") ? "red" : "green";
  }

  return (
    <Flex 
      justify="space-between" 
      style={{ padding: "12px 8px", borderBottom: "1px solid #f0f0f0" }}
    >
      <Text>{name}</Text>
      <Text style={{ color: finalColor, fontWeight: 500 }}>
        {value} {unit !== undefined ? unit : "VNĐ"}
      </Text>
    </Flex>
  );
};
