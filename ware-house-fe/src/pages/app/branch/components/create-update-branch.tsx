import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../../constants/query-keys";
import dispatchToast from "../../../../constants/toast";
import { VIETNAM_PHONE_NUMBER } from "../../../../utils/regex";
import { createBranchApi, updateBranchApi } from "../../../../api/branch";

export type BranchFormData = {
  address: string;
  name: string;
  phone: string;
  id: string;
};

export type BranchFormRef = {
  show: (data?: Partial<BranchFormData>) => void;
  hide: () => void;
};

const initForm: BranchFormData = {
  address: "",
  phone: "",
  name: "",
  id: "",
};
const BranchFormModal = forwardRef<BranchFormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BranchFormData>(initForm);
  const [form] = Form.useForm<BranchFormData>();

  const isUpdate = useMemo(() => category.id, [category.id]);
  const queryClient = useQueryClient();
  useImperativeHandle(ref, () => ({
    show: (data) => {
      console.log("data", data);
      
      setOpen(true)
      form.setFieldsValue(data ? data : initForm);
      setCategory((data ? data : initForm) as BranchFormData);
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
      setCategory(initForm as BranchFormData);
    },
  }));

  const { mutate } = useMutation({
    mutationFn: (payload: BranchFormData) =>{
     return isUpdate
        ? updateBranchApi({ ...payload, branchId: category.id })
        : createBranchApi(payload)},
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Tạo"} chi nhánh thành công`,
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
          `${isUpdate ? "Cập nhật" : "Tạo"} chi nhánh thất bại`,
      );
    },
  });

  const onFinish = (values: BranchFormData) => {
    mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Chi tiết chi nhánh"
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
          label="Tên chi nhánh"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
        >
          <Input onChange={(event)=> form.setFieldValue('name', event.target.value?.toUpperCase() || "")} />
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
          label="Địa chỉ"
          name="address"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ chi nhánh" },
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

export default BranchFormModal;
