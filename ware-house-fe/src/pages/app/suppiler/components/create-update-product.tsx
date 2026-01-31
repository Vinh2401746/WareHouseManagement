import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input } from "antd";
import { useMutation } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import { VIETNAM_PHONE_NUMBER } from "../../../../utils/regex";
import { createSuppliersApi, updateSupplierApi } from "../../../../api/supplier";

export type SupplierFormData = {
  phone: string;
  name: string;
  email: string;
  address: string;
  id: string;
};

export type SupplierFormRef = {
  show: (data?: Partial<SupplierFormData>) => void;
  hide: () => void;
};

const initForm: SupplierFormData = {
  phone: "",
  name: "",
  email: "",
  address: '',
  id: "",
};

type ProductFormModalProps = {
  onSuccess:()=> void,
  onError?:()=> void,
}

const SupplierFormModal = forwardRef<SupplierFormRef,ProductFormModalProps>(({onSuccess}, ref) => {
  const [open, setOpen] = useState(false);
  const [supplier, setpSupplier] = useState<SupplierFormData>(initForm);
  const [form] = Form.useForm<SupplierFormData>();


  const isUpdate = useMemo(() => supplier.id, [supplier.id]);

  useImperativeHandle(ref, () => ({
    show: (data) => {
      setOpen(true);
      form.setFieldsValue(data ? data : initForm);
      setpSupplier((data ? data : initForm) as SupplierFormData);
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
    },
  }));


  const { mutate } = useMutation({
    mutationFn: (payload: SupplierFormData) => {
      return isUpdate
        ? updateSupplierApi({ ...payload, supplierId: supplier.id })
        : createSuppliersApi(payload);
    },
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Tạo"} nhà cung cấp thành công`,
      );
      setOpen(false);
      onSuccess()
    },
    onError: (error: any) => {
      console.log("error", error);

      dispatchToast(
        "warning",
        error?.response?.data?.message ||
          `${isUpdate ? "Cập nhật" : "Tạo"} nhà cung cấp thất bại`,
      );
    },
  });

  const onFinish = (values: SupplierFormData) => {
    console.log("Submit:", values);
    mutate({
      ...values,
    });
  };

  return (
    <Modal
      open={open}
      title={`${!isUpdate ? "Tạo" : "Cập nhật"} nhà cung cấp`}
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      // destroyOnHidden
      okText={`${!isUpdate ? "Tạo" : "Cập nhật"}`}
      cancelText="Đóng"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initForm}
      >
        <Form.Item
          label="Tên nhà cung cấp"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" },

             {
              validator(_, value ) {
                const includesNumber = !VIETNAM_PHONE_NUMBER.test(value)
                if(!includesNumber){
                  return Promise.resolve()
                }
                return Promise.reject("Vui lòng nhập số điện thoại hợp lệ")
              },
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email", },
            { required: true, type:'email', message: "Vui lòng nhập email hợp lệ", },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
           <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default SupplierFormModal;
