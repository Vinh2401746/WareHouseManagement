import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ToolOutlined } from "@ant-design/icons";

const NoPermissonPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      icon={<ToolOutlined />}
      title="Bạn không có quyền thao thác chức năng này"
      subTitle="Vui lòng liên hệ quản trị viên để có thể tiếp tục."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      }
    />
  );
};

export default NoPermissonPage;
