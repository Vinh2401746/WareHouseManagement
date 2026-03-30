import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input } from "antd";
import { useMutation } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import { VIETNAM_PHONE_NUMBER } from "../../../../utils/regex";
import { createCustomerApi, updateCustomerApi, type Customer } from "../../../../api/customer";

export type CustomerFormRef = {
  show: (data?: Partial<Customer>) => void;
  hide: () => void;
};

const initForm: Partial<Customer> = {
  phone: "",
  name: "",
  address: '',
  id: "",
};

type CustomerFormModalProps = {
  onSuccess: () => void,
  onError?: () => void,
}

const CustomerFormModal = forwardRef<CustomerFormRef, CustomerFormModalProps>(({ onSuccess }, ref) => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<Partial<Customer>>(initForm);
  const [form] = Form.useForm<Partial<Customer>>();

  const isUpdate = useMemo(() => customer.id, [customer.id]);

  useImperativeHandle(ref, () => ({
    show: (data) => {
      setOpen(true);
      form.setFieldsValue(data ? data : initForm);
      setCustomer((data ? data : initForm) as Partial<Customer>);
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
    },
  }));

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) => {
      return isUpdate
        ? updateCustomerApi(customer.id as string, payload)
        : createCustomerApi(payload);
    },
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Thêm mới"} khách hàng thành công`,
      );
      setOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.log("error", error);
      dispatchToast(
        "warning",
        error?.response?.data?.message ||
        `${isUpdate ? "Cập nhật" : "Thêm mới"} khách hàng thất bại`,
      );
    },
  });

  const onFinish = (values: Partial<Customer>) => {
    mutate({
      name: values.name,
      phone: values.phone,
      address: values.address
    });
  };

  return (
    <Modal
      open={open}
      title={`${!isUpdate ? "Thêm" : "Cập nhật"} khách hàng`}
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      okText={`${!isUpdate ? "Thêm" : "Cập nhật"}`}
      cancelText="Đóng"
      confirmLoading={isPending}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initForm}
      >
        <Form.Item
          label="Tên khách hàng"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
        >
          <Input placeholder="Nhập họ và tên..." />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                const isValid = VIETNAM_PHONE_NUMBER.test(value);
                if (isValid) {
                  return Promise.resolve();
                }
                return Promise.reject("Vui lòng nhập số điện thoại hợp lệ");
              },
            }
          ]}
        >
          <Input placeholder="Ví dụ: 0987123456..." />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
        >
          <Input.TextArea placeholder="(Tuỳ chọn) Nhập địa chỉ khách hàng..." rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default CustomerFormModal;
