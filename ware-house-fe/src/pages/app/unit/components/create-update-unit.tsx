import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../../constants/query-keys";
import { createUnit, updateUnit } from "../../../../api/unit";
import dispatchToast from "../../../../constants/toast";

export type UnitFormData = {
  code: string;
  name: string;
  id: string;
};

export type UnitFormRef = {
  show: (data?: Partial<UnitFormData>) => void;
  hide: () => void;
};

const initForm: UnitFormData = {
  code: "",
  name: "",
  id: "",
};
const UnitFormModal = forwardRef<UnitFormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<UnitFormData>(initForm);
  const [form] = Form.useForm<UnitFormData>();

  const isUpdate = useMemo(() => unit.id, [unit.id]);
  const queryClient = useQueryClient();
  useImperativeHandle(ref, () => ({
    show: (data) => {
      console.log("data", data);
      
      setOpen(true)
      form.setFieldsValue(data ? data : initForm);
      setUnit((data ? data : initForm) as UnitFormData);
    },
    hide: () => {
      setOpen(false);
      form.resetFields();
      setUnit(initForm as UnitFormData);
    },
  }));

  const { mutate } = useMutation({
    mutationFn: (payload: UnitFormData) =>{
     return isUpdate
        ? updateUnit({ ...payload, unitId: unit.id })
        : createUnit(payload)},
    onSuccess: () => {
      dispatchToast(
        "success",
        `${isUpdate ? "Cập nhật" : "Tạo"} đơn vị thành công`,
      );
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.unit.list],
      });
    },
    onError: (error: any) => {
      console.log("error", error);

      dispatchToast(
        "warning",
        error?.response?.data?.message ||
          `${isUpdate ? "Cập nhật" : "Tạo"} đơn vị thất bại`,
      );
    },
  });

  const onFinish = (values: UnitFormData) => {
    mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Chi tiết đơn vị"
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
          label="Tên đơn vị"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên đơn vị" }]}
        >
          <Input maxLength={24} />
        </Form.Item>

        <Form.Item
          label="Mã đơn vị"
          name="code"
          rules={[
            { required: true, message: "Vui lòng nhập mã đơn vị" },
          ]}
        >
          <Input maxLength={24} onChange={(event)=> form.setFieldValue('code', event.target.value?.toUpperCase() || "")}/>
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

export default UnitFormModal;
