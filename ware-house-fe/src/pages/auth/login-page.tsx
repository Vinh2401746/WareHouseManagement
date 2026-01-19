import { memo } from "react";
import { useAppDispatch } from "../../store/hooks";
import { loginRequest } from "../../store/toolkit/auth";
import {
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography } from "antd";

import "./login-page.css";
type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};
const { Title } = Typography;

export const LoginPage = memo(() => {
  console.log("loginPages");

  const dispatch = useAppDispatch();

  const onFinish = (values: { email: string; password: string }) => {
    console.log("Login data:", values);
    dispatch(
      loginRequest({
        email: "admin@gmail.com",
        password: "admin123",
      }),
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Title level={1} className="login-title">
          Quản Trị Kho
        </Title>

        <Form
          name="basic"
          //   labelCol={{ span: 8 }}
          //   wrapperCol={{ span: 16 }}
          //   style={{ maxWidth: 600 }}
          initialValues={{
            remember: true,
            email: "admin@gmail.com",
            password: "admin123",
          }}
          onFinish={onFinish}
          //   onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
          >
            <Input  prefix={<MailOutlined />}/>
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
           
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password  prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item<FieldType>
            name="remember"
            valuePropName="checked"
            className="login-remember"
            label={null}
          >
            <Checkbox
              style={{
                alignSelf: "flex-start",
              }}
            >
              Lưu tài khoản
            </Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%", height: 48 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});
