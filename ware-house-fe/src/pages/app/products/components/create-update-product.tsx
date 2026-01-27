import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { CATEGORIES, ROLES, UNITS } from "../../../../constants/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../../constants/query-keys";
import type { GetCategoriesRequestType } from "../../../../types/category";
import { getCategorysApi } from "../../../../api/category";

export type ProductFormData = {
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  id: string;
};

export type ProductFormRef = {
  show: (data?: Partial<ProductFormData>) => void;
  hide: () => void;
};

const initForm: ProductFormData = {
  code: "",
  name: "",
  category: "",
  unit: "",
  minStock: 0,
  id: "",
};
const ProductFormModal = forwardRef<ProductFormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [product, setproduct] = useState<ProductFormData>(initForm);
  const [form] = Form.useForm<ProductFormData>();

  const { data } = useQuery({
    queryKey: [QueryKeys.category.list],
    queryFn: () => {
      return getCategorysApi({ page: 0, limit: 1000000000 });
    },
  });

  const category = useMemo(()=> data?.results?.map((item)=>({
    value:item.id,
    label:item.name
  })),[data?.results])
  console.log("data u[date product", data);
  

  // const isUpdate = useMemo(() => product.id, [product.id]);
  const queryClient = useQueryClient();
  useImperativeHandle(ref, () => ({
    show: (data) => {
      setOpen(true);
      form.setFieldsValue(data ? data : initForm);
      setproduct((data ? data : initForm) as ProductFormData);
      // if (data) {
      //   form.setFieldsValue({
      //     ...data,
      //   });
      //   setproduct(data as ProductFormData)
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
    // mutationFn: (payload: ProductFormData) =>{
    //  return isUpdate
    //     ? updateUser({ ...payload, id: product.id })
    //     : createUser(payload)},
    onSuccess: () => {
      // dispatchToast(
      //   "success",
      //   `${isUpdate ? "Cập nhật" : "Tạo"} người dùng thành công`,
      // );
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.users.users],
      });
    },
    onError: (error: any) => {
      console.log("error", error);

      // dispatchToast(
      //   "warning",
      //   error?.response?.data?.message ||
      //     `${isUpdate ? "Cập nhật" : "Tạo"} người dùng thất bại`,
      // );
    },
  });

  const onFinish = (values: ProductFormData) => {
    // console.log("Submit:", values);
    // mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Chi tiết sản phẩm"
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      // destroyOnHidden
      // okText={`${!isUpdate ? "Tạo" : "Cập nhật"}`}
      cancelText="Đóng"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initForm}
      >
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã sản phẩm"
          name="code"
          rules={[
            { required: true, message: "Vui lòng nhập mã sản phẩm" },
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
        <Form.Item
          label="Danh mục"
          name="category"
          rules={[
            { required: true, message: "Vui lòng chọn danh mục sản phẩm" },
          ]}
        >
          <Select options={category|| []} />
        </Form.Item>
        <Form.Item
          label="Đơn vị"
          name="unit"
          rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
        >
          <Select options={UNITS} />
        </Form.Item>
        <Form.Item
          label="Tồn kho tối thiểu"
          name="minStock"
          rules={[
            { required: true, message: "Vui lòng chọn nhập tồn kho tối thiểu" },
            { type: "number", message: "Vui lòng chỉ nhập số" },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default ProductFormModal;
