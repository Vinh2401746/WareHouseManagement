import { LockOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { useAppDispatch } from "../store/hooks";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../api/users/users";
import dispatchToast from "../constants/toast";
type FieldType = {
  oldpassword: string;
  newpassword: string;
  repassword: string;
};

type ChangePasswordProps = {
  onClose: () => void;
};
export const ChangePassword = ({ onClose }: ChangePasswordProps) => {
  const [form] = useForm<FieldType>();
  const dispatch = useAppDispatch();

  const { mutate } = useMutation({
    mutationFn: (payload: any) => createUser(payload),
    onSuccess: () => {
      dispatchToast("success", `Đổi mật khẩu thành công`);
      onClose();
    },
    onError: (error: any) => {
      console.log("error", error);
      dispatchToast("success", `Đổi mật khẩu thất bại`);
    },
  });

  const onFinish = useCallback(
    async (values: FieldType) => {
      //    dispatch(
      //    );
    },
    [dispatch],
  );
  return (
    <>
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
          label="Mật khẩu cũ"
          name="oldpassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item<FieldType>
          label="Mật khẩu mới"
          name="newpassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item<FieldType>
          label="Nhập lại mật khẩu mới"
          name="repassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            {
              validator: (_, value) =>
                value === form.getFieldValue("newpassword")
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Xác nhận mật khẩu không chính xác"),
                    ),
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Flex justify="end" gap={20}>
          <Button onClick={onClose}>Huỷ</Button>

          <Form.Item label={null}>
            <Button
              // disabled={loading}
              type="primary"
              htmlType="submit"
              //   style={{ width: "100%", height: 48 }}
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Flex>
      </Form>
    </>
  );
};
