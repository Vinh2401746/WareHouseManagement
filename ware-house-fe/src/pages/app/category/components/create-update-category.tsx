import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../../constants/query-keys";
import { createCategory, updateCategory } from "../../../../api/category";
import dispatchToast from "../../../../constants/toast";

export type CategoryFormData = {
  code: string;
  name: string;
  id: string;
};

export type CategoryFormRef = {
  show: (data?: Partial<CategoryFormData>) => void;
  hide: () => void;
};

const initForm: CategoryFormData = {
  code: "",
  name: "",
  id: "",
};
const CategoryFormModal = forwardRef<CategoryFormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryFormData>(initForm);
  const [form] = Form.useForm<CategoryFormData>();

  const isUpdate = useMemo(() => category.id, [category.id]);
  const queryClient = useQueryClient();
  useImperativeHandle(ref, () => ({
    show: (data) => {
      console.log("data", data);
      
      setOpen(true)
      form.setFieldsValue(data ? data : initForm);
      setCategory((data ? data : initForm) as CategoryFormData);
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
      setCategory(initForm as CategoryFormData);
    },
  }));

  const { mutate } = useMutation({
    mutationFn: (payload: CategoryFormData) =>{
     return isUpdate
        ? updateCategory({ ...payload, categoryId: category.id })
        : createCategory(payload)},
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Tạo"} danh mục thành công`,
      );
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.category.list],
      });
    },
    onError: (error: any) => {
      console.log("error", error);

      dispatchToast(
        "warning",
        error?.response?.data?.message ||
          `${isUpdate ? "Cập nhật" : "Tạo"} danh mục thất bại`,
      );
    },
  });

  const onFinish = (values: CategoryFormData) => {
    mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Chi tiết danh mục"
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
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã danh mục"
          name="code"
          rules={[
            { required: true, message: "Vui lòng nhập mã danh mục" },
          ]}
        >
          <Input />
        </Form.Item>
        {/* {!isUpdate && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
            ]}
          >
            <Input />
          </Form.Item>
        )} */}
      </Form>
    </Modal>
  );
});

export default CategoryFormModal;
