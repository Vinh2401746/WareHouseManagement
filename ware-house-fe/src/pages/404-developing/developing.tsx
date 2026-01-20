import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ToolOutlined } from "@ant-design/icons";

const DevelopingPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      icon={<ToolOutlined />}
      title="Tính năng đang phát triển"
      subTitle="Chức năng này hiện chưa hoàn thiện. Vui lòng quay lại sau."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      }
    />
  );
};

export default DevelopingPage;
