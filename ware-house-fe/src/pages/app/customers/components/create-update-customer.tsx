import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useMutation } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import { VIETNAM_PHONE_NUMBER } from "../../../../utils/regex";
import { useQuery } from "@tanstack/react-query";
import { createCustomerApi, updateCustomerApi, type Customer } from "../../../../api/customer";
import { getBranchsApi } from "../../../../api/branch";
import { usePermission } from "../../../../hooks/usePermission";

export type CustomerFormRef = {
  show: (data?: Partial<Customer>) => void;
  hide: () => void;
};

const initForm: Partial<Customer> = {
  phone: "",
  name: "",
  address: '',
  email: '',
  branch: undefined,
  note: '',
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
  const { isSuperAdmin } = usePermission("customers");

  // Fetch branch list if superadmin
  const { data: branchData } = useQuery({
    queryKey: ["app.branches"],
    queryFn: () => getBranchsApi({ page: 1, limit: 100 }), // Get all branches
    enabled: isSuperAdmin,
  });

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
    const payload: any = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      email: values.email,
      note: values.note,
    };
    if (isSuperAdmin && values.branch) {
      payload.branch = values.branch;
    }
    mutate(payload);
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
          <Input placeholder="Nhập địa chỉ khách hàng..." />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: 'email', message: 'Vui lòng nhập định dạng email hợp lệ' }]}
        >
          <Input placeholder="Ví dụ: example@gmail.com" />
        </Form.Item>

        {isSuperAdmin && (
          <Form.Item
            label="Chi nhánh"
            name="branch"
            rules={[{ required: true, message: "Bắt buộc chọn chi nhánh" }]}
          >
            <Select 
              placeholder="Chọn chi nhánh quản lý khách này..." 
              options={branchData?.results?.map((b: any) => ({
                label: b.name,
                value: b.id
              })) || []}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Ghi chú thêm"
          name="note"
        >
          <Input.TextArea placeholder="(Tuỳ chọn) Ghi chú..." rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default CustomerFormModal;
