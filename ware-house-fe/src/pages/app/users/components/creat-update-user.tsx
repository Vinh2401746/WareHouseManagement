import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { ROLES } from "../../../../constants/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser } from "../../../../api/users/users";
import type { roles } from "../../../../types/auth";
import dispatchToast from "../../../../constants/toast";
import { QueryKeys } from "../../../../constants/query-keys";
import { getBranchsApi } from "../../../../api/branch";

export type UserFormData = {
  name: string;
  email: string;
  role: roles;
  id: string;
  password: string;
  branch:string
};

export type UserFormRef = {
  show: (data?: Partial<UserFormData>) => void;
  hide: () => void;
};

const initForm: UserFormData = {
  name: "",
  email: "",
  id: "",
  password: "",
  branch: "",
  role: null,
};
const UserFormModal = forwardRef<UserFormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [dataUser, setDataUser] = useState<UserFormData>(initForm);
  const [form] = Form.useForm<UserFormData>();

  const isUpdate = useMemo(() => dataUser.id, [dataUser.id]);
  const queryClient = useQueryClient();
  useImperativeHandle(ref, () => ({
    show: (data) => {
      setOpen(true);
      form.setFieldsValue(data ? data : initForm);
      setDataUser((data ? data : initForm) as UserFormData);
      // if (data) {
      //   form.setFieldsValue({
      //     ...data,
      //   });
      //   setDataUser(data as UserFormData)
      // } else {
      //   form.resetFields();
      // }
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
    },
  }));

  const { mutate } = useMutation({
    mutationFn: (payload: UserFormData) =>
      isUpdate
        ? updateUser({ ...payload, id: dataUser.id })
        : createUser(payload),
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Tạo"} người dùng thành công`,
      );
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.users.users],
      });
    },
    onError: (error: any) => {
      console.log("error", error);

      dispatchToast(
        "warning",
        error?.response?.data?.message ||
          `${isUpdate ? "Cập nhật" : "Tạo"} người dùng thất bại`,
      );
    },
  });

   const { data } = useQuery({
    queryKey: [QueryKeys.branch.list, {page:0, limit:100000}],
    queryFn: ({ queryKey }) => {
    return getBranchsApi({page:0 , limit:100000});
  },
    gcTime: 15 * 60 * 1000 // 15 phut cache
  });

  console.log("data",data)

  const onFinish = (values: UserFormData) => {
    // console.log("Submit:", values);
    mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Người dùng"
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
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Sai định dạng email" },
          ]}
        >
          <Input />
        </Form.Item>
        {!isUpdate && (
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
        )}

        <Form.Item
          label="Quyền"
          name="role"
          rules={[
            { required: true, message: "Vui lòng chọn quyền người dùng" },
          ]}
        >
          <Select options={ROLES} />
        </Form.Item>
         <Form.Item
          label="Cửa hàng"
          name="branch"
          rules={[
            { required: true, message: "Vui lòng chọn cửa hàng người dùng" },
          ]}
        >
          <Select options={data?.results?.map(item=>({
            label:item.name,
            value:item.id
          })) || []} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default UserFormModal;
