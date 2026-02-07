import { memo, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginRequest } from "../../store/toolkit/auth";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Form, Input, Typography } from "antd";

import "./login-page.css";
import { LOCAL_KEYS } from "../../constants/local-keys";
import { useForm } from "antd/es/form/Form";
import { AppRoutes } from "../../router/routes";
import { useNavigate } from "react-router-dom";
type FieldType = {
  email: string;
  password: string;
  remember: string;
};
const { Title } = Typography;

export const LoginPage = memo(() => {
  const [form] = useForm<FieldType>();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state)=>state.auth.loading)
  const navigate = useNavigate();

  useEffect(() => {
    const un_store = localStorage.getItem(LOCAL_KEYS.USER_NAME);
    const pw_store = localStorage.getItem(LOCAL_KEYS.PASSWORD);
    if (un_store && pw_store) {
      form.setFieldsValue({
        email: un_store,
        password: pw_store,
        remember: "true",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNavigateForgot = () => {
    navigate(AppRoutes.auth.forgot_pass);
  };

  const onFinish = useCallback(
    async (values: FieldType) => {
        dispatch(
          loginRequest({
            email: values.email,
            password: values.password
          }),
        );

      if (values.remember) {
        localStorage.setItem(LOCAL_KEYS.USER_NAME, values.email);
        localStorage.setItem(LOCAL_KEYS.PASSWORD, values.password);
      } else {
        localStorage.removeItem(LOCAL_KEYS.USER_NAME);
        localStorage.removeItem(LOCAL_KEYS.PASSWORD);
      }
    },
    [dispatch],
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

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Flex justify="space-between" >
            <Form.Item<FieldType>
              name="remember"
              valuePropName="checked"
              // className="login-remember"
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
            <Button style={{padding: 0}} type="link" onClick={onNavigateForgot}>Quên mật khẩu</Button>
          </Flex>

          <Form.Item label={null}>

            <Button
              // disabled={loading}
              loading={loading}
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
