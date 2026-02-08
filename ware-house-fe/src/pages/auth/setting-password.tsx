import { memo, useCallback } from "react";
import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";

import "./login-page.css";
import { useForm } from "antd/es/form/Form";
import { useMutation } from "@tanstack/react-query";
import dispatchToast from "../../constants/toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authResetPasswordApi } from "../../api/auth/auth";
import { AppRoutes } from "../../router/routes";
type FieldType = {
  password: string;
  renewpassword: string;
};
const { Title } = Typography;

const SettingPasswordPage = memo(() => {
  const [form] = useForm<FieldType>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { token: string; password: string }) =>
      authResetPasswordApi(payload),
    onSuccess: () => {
      dispatchToast(
        "success",
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập để tiếp tục",
      );
      navigate(AppRoutes.auth.login, { replace: true });
    },
    onError: (error: any) => {
      console.log("error", error);
      dispatchToast(
        "error",
        error?.response?.data?.message ||
          "Đặt lại lại mật khẩu thất bại. Vui lòng liên hệ admin.",
      );
    },
  });

  const onFinish = useCallback(
    async (values: FieldType) => {
      if (!token) {
        return dispatchToast(
          "error",
          "Không thể đặt lại mật khẩu. Vui lòng liên hệ admin để được hỗ trợ",
        );
      }
      mutate({
        token: "",
        password: values.password,
      });
    },
    [mutate, token],
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <Title level={1} className="login-title">
          Quản Trị Kho
        </Title>
        <Title level={3} className="login-title">
          Đặt lại mật khẩu
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
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item<FieldType>
            label="Nhập lại mật khẩu"
            name="renewpassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              {
                validator: (_, value) =>
                  value === form.getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Xác nhận mật khẩu không chính xác"),
                      ),
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item label={null}>
            <Button
              disabled={isPending}
              type="primary"
              htmlType="submit"
              style={{ width: "100%", height: 48 }}
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});


export default SettingPasswordPage