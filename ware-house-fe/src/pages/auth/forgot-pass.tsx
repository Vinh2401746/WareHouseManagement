import { memo, useCallback } from "react";
import {  MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";

import "./login-page.css";
import { useForm } from "antd/es/form/Form";
import { useMutation } from "@tanstack/react-query";
import { requestResetPassword } from "../../api/users/users";
import dispatchToast from "../../constants/toast";
import { useNavigate } from "react-router-dom";
type FieldType = {
  email: string;
};
const { Title } = Typography;

export const ForgotPasswordPage = memo(() => {
  const [form] = useForm<FieldType>();
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { email: string }) => requestResetPassword(payload),
    onSuccess: () => {
      dispatchToast(
        "success",
        "Yêu cầu cấp lại mật khẩu thành công. Vui lòng kiểm tra email để tiếp tục",
      );
      navigate(-1);
    },
    onError: (error:any) => {
        console.log("error", error);
        
      dispatchToast(
        "error",
       error?.response?.data?.message || "Yêu cầu cấp lại mật khẩu thất bại. Vui lòng liên hệ admin.",
      );
    },
  });

  const onFinish = useCallback(
    async (values: FieldType) => {
      mutate({
        email: values.email,
      });
    },
    [mutate],
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <Title level={1} className="login-title">
          Quản Trị Kho
        </Title>

        <Form
          name="basic"
          form={form}
          //   labelCol={{ span: 8 }}
          //   wrapperCol={{ span: 16 }}
          //   style={{ maxWidth: 600 }}
          // initialValues={{
          //   remember: true,
          //   email: "admin@gmail.com",
          //   password: "admin123",
          // }}
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
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label={null}>
            <Button
            disabled={isPending}
              type="primary"
              htmlType="submit"
              style={{ width: "100%", height: 48 }}
            >
              Yêu cầu cấp mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});
