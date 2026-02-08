import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import {
  createWarehouseApi,
  updateWarehousesApi,
} from "../../../../api/warehouse";
import { QueryKeys } from "../../../../constants/query-keys";
import { getBranchsApi } from "../../../../api/branch";

export type WarehouseFormData = {
  branch: string;
  name: string;
  id: string;
  address:string
};

export type UnitFormRef = {
  show: (data?: Partial<WarehouseFormData>) => void;
  hide: () => void;
  onSuccessUnit?: () => void;
};

const initForm: WarehouseFormData = {
  branch: "",
  name: "",
  id: "",
  address: ''
};

type WarehouseFormModalProps = {
  onSuccessModal: () => void;
};
const WarehouseFormModal = forwardRef<UnitFormRef, WarehouseFormModalProps>(
  ({ onSuccessModal }, ref) => {
    const [open, setOpen] = useState(false);
    const [warehouse, setWarehouse] = useState<WarehouseFormData>(initForm);
    const [form] = Form.useForm<WarehouseFormData>();

    const { data } = useQuery({
      queryKey: [QueryKeys.branch.list],
      queryFn: () => {
        return getBranchsApi({ page: 1, limit: 1000000000 });
      },
    });

    const branchs = useMemo(
      () =>
        data?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name}-${item?.phone}`,
        })),
      [data?.results],
    );

    const isUpdate = useMemo(() => warehouse.id, [warehouse.id]);
    useImperativeHandle(ref, () => ({
      show: (data) => {
        console.log("data", data);

        setOpen(true);
        form.setFieldsValue(data ? {...data, branch:data.branch?.id || ''} : initForm);
        setWarehouse((data ? data : initForm) as WarehouseFormData);
      },
      hide: () => {
        setOpen(false);
        form.resetFields();
        setWarehouse(initForm as WarehouseFormData);
      },
    }));

    const { mutate } = useMutation({
      mutationFn: (payload: WarehouseFormData) => {
        return isUpdate
          ? updateWarehousesApi({ ...payload, warehouseId: warehouse.id })
          : createWarehouseApi(payload);
      },
      onSuccess: () => {
        dispatchToast(
          "success",
          `${isUpdate ? "Cập nhật" : "Tạo"} kho thành công`,
        );
        setOpen(false);
        onSuccessModal();
      },
      onError: (error: any) => {
        console.log("error", error);

        dispatchToast(
          "warning",
          error?.response?.data?.message ||
            `${isUpdate ? "Cập nhật" : "Tạo"} kho thất bại`,
        );
      },
    });

    const onFinish = (values: WarehouseFormData) => {
      mutate(values);
    };

    return (
      <Modal
        open={open}
        title="Chi tiết kho"
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
            label="Tên kho"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
          >
            <Input maxLength={24} />
          </Form.Item>

          <Form.Item
            label="Chi nhánh"
            name="branch"
            rules={[{ required: true, message: "Vui lòng nhập chi nhánh" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={branchs || []}
            />
          </Form.Item>
             <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input maxLength={24} />
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
  },
);

export default WarehouseFormModal;
