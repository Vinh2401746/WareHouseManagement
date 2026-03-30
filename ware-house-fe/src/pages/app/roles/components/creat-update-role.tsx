import { Form, Input, Select, type FormInstance } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import type { PostRoleType, RoleType, UpdateRoleType } from "../../../../types/role";
import ModalCommon, { type ModalCommonRef } from "../../../../components/modal";
import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRoleApi, updateRoleApi } from "../../../../api/roles";
import { getPermissionsApi } from "../../../../api/permissions";
import dispatchToast from "../../../../constants/toast";

export type RoleFormRef = {
  show: (data?: RoleType) => void;
  hide: () => void;
  form: FormInstance;
};

type Props = {
  onRecall: () => void;
};

const RoleFormModal = forwardRef<RoleFormRef, Props>(({ onRecall }, ref) => {
  const [form] = Form.useForm();
  const modalRef = useRef<ModalCommonRef>(null);
  const [currentRecord, setCurrentRecord] = useState<RoleType | null>(null);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (param: PostRoleType) => createRoleApi(param),
    onSuccess: () => {
      dispatchToast("success", "Thêm vai trò thành công");
      modalRef.current?.hide();
      onRecall();
    },
    onError: (err: any) => {
      dispatchToast("error", err?.response?.data?.message || "Thêm thất bại");
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (param: UpdateRoleType) => updateRoleApi(param),
    onSuccess: () => {
      dispatchToast("success", "Cập nhật vai trò thành công");
      modalRef.current?.hide();
      onRecall();
    },
    onError: (err: any) => {
      dispatchToast("error", err?.response?.data?.message || "Cập nhật thất bại");
    },
  });

  const { data: listPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions-all"],
    queryFn: () => getPermissionsApi(),
  });

  useImperativeHandle(ref, () => ({
    show: (data) => {
      modalRef.current?.show();
      setCurrentRecord(data || null);
      if (data) {
        form.setFieldsValue({
          name: data.name,
          key: data.key,
          description: data.description,
          scope: data.scope,
          // Extract array string permissionIds từ data get
          permissionIds: data.permissionIds ? data.permissionIds.map((p: any) => p.id || p) : [],
        });
      } else {
        form.resetFields();
      }
    },
    hide: () => {
      modalRef.current?.hide();
    },
    form,
  }));

  const onFinish = (values: PostRoleType) => {
    if (currentRecord) {
      updateMutate({ id: currentRecord.id, ...values });
    } else {
      createMutate(values);
    }
  };

  return (
    <ModalCommon
      ref={modalRef}
      title={currentRecord ? "Cập Nhật Vai Trò" : "Thêm Vai Trò Mới"}
      onOk={() => form.submit()}
      okText={currentRecord ? "Cập Nhật" : "Thêm Mới"}
      cancelText="Huỷ"
      confirmLoading={isCreating || isUpdating}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ scope: 'global', permissionIds: [] }}
      >
        <Form.Item
          name="name"
          label="Tên Vai Trò"
          rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
        >
          <Input placeholder="VD: Quản lý kho" />
        </Form.Item>
        <Form.Item
          name="key"
          label="Mã định danh (Key)"
          rules={[{ required: true, message: "Vui lòng nhập mã định danh" }]}
        >
          <Input placeholder="VD: warehouse_manager" disabled={!!currentRecord} />
        </Form.Item>
        <Form.Item
          name="scope"
          label="Phạm Vi (Scope)"
          rules={[{ required: true, message: "Vui lòng chọn phạm vi" }]}
        >
          <Select
            options={[
              { value: 'global', label: 'Global (Hệ Thống)' },
              { value: 'branch', label: 'Branch (Chi Nhánh)' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô Tả"
        >
          <Input.TextArea placeholder="Mô tả chức năng quyền hạn" />
        </Form.Item>
        <Form.Item
          name="permissionIds"
          label="Cấp Phát Quyền Hạn (Permissions)"
          help="Chọn trực tiếp kho quyền hệ thống"
        >
           <Select 
            mode="multiple" 
            style={{ width: '100%' }} 
            placeholder="Chọn các quyền"
            options={listPermissions?.results?.map((p: any) => ({ label: `${p.name} - ${p.code}`, value: p.id })) || []}
            loading={isLoadingPermissions}
           />
        </Form.Item>
      </Form>
    </ModalCommon>
  );
});

export default RoleFormModal;
