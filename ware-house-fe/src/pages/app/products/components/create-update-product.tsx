import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useMutation, useQueries } from "@tanstack/react-query";
import { QueryKeys } from "../../../../constants/query-keys";
import { getCategorysApi } from "../../../../api/category";
import { createProductApi, updateProductsApi } from "../../../../api/products";
import dispatchToast from "../../../../constants/toast";
import { ONLY_NUMBER } from "../../../../utils/regex";
import { getUnitsApi } from "../../../../api/unit";
import type {
  CreateProductRequestType,
  UpdateProductRequestType,
} from "../../../../types/products";

export type ProductFormData = {
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number | null;
  id: string;
};

export type ProductFormRef = {
  show: (data?: Partial<ProductFormData>) => void;
  hide: () => void;
};

const initForm: ProductFormData = {
  code: "",
  name: "",
  category:'',
  unit: '',
  minStock: null,
  id: "",
};

type ProductFormModalProps = {
  onSuccess: () => void;
  onError?: () => void;
};

const ProductFormModal = forwardRef<ProductFormRef, ProductFormModalProps>(
  ({ onSuccess }, ref) => {
    const [open, setOpen] = useState(false);
    const [product, setproduct] = useState<ProductFormData>(initForm);
    const [form] = Form.useForm<ProductFormData>();

    // const { data } = useQuery({
    //   queryKey: [QueryKeys.category.list],
    //   queryFn: () => {
    //     return getCategorysApi({ page: 0, limit: 1000000000 });
    //   },
    // });

    const multiData = useQueries({
      queries: [
        // {
        //   queryKey: [QueryKeys.category.list],
        //   queryFn: () => getCategorysApi({ page: 1, limit: 1000000000 }),
        //   staleTime: 5 * 60 * 1000,
        //   gcTime:  5 * 60 * 1000,
        // },
        {
          queryKey: [QueryKeys.unit.list],
          queryFn: () => getUnitsApi({ page: 1, limit: 1000000000 }),
          staleTime: 5 * 60 * 1000,
           gcTime:  5 * 60 * 1000,
        },
      ],
    });

    // const category = useMemo(
    //   () =>
    //     multiData[0]?.data?.results?.map((item: any) => ({
    //       value: item.id,
    //       label: item.name,
    //     })) || [],
    //   [multiData],
    // );

    const units = useMemo(
      () =>
        multiData[0]?.data?.results?.map((item: any) => ({
          value: item.id,
          label: item.name,
        })) || [],
      [multiData],
    );

    const isUpdate = useMemo(() => product.id, [product.id]);

    useImperativeHandle(ref, () => ({
      show: (data:any) => {
        console.log("data");
        setOpen(true);
        form.setFieldsValue(
          data
            ? {
                ...data,
                unit: data?.unit?.id || "",
                category: data?.category?.id || "",
              }
            : initForm,
        );
        setproduct((data ? data : initForm) as ProductFormData);
      },
      hide: () => {
        setOpen(false);
        form.resetFields();
      },
    }));

    const { mutate } = useMutation({
      mutationFn: (payload: ProductFormData) => {
        return isUpdate
          ? updateProductsApi({
              ...payload,
              productId: product.id,
            } as UpdateProductRequestType)
          : createProductApi({
              ...payload,
            } as CreateProductRequestType);
      },
      onSuccess: () => {
        dispatchToast(
          "success",
          `${isUpdate ? "Cập nhật" : "Tạo"} sản phẩm thành công`,
        );
        setOpen(false);
        onSuccess();
      },
      onError: (error: any) => {
        console.log("error", error);

        dispatchToast(
          "warning",
          error?.response?.data?.message ||
            `${isUpdate ? "Cập nhật" : "Tạo"} sản phẩm thất bại`,
        );
      },
    });

    const onFinish = (values: ProductFormData) => {
      console.log("Submit:", values);
      mutate({
        ...values,
        minStock: Number(values.minStock),
      });
    };

    return (
      <Modal
        open={open}
        title={`${!isUpdate ? "Tạo" : "Cập nhật"} sản phẩm`}
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
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mã sản phẩm"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm" }]}
          >
            <Input
              onChange={(event) =>
                form.setFieldValue(
                  "code",
                  event.target.value?.toUpperCase() || "",
                )
              }
            />
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
          {/* <Form.Item
            label="Danh mục"
            name="category"
            rules={[
              { required: true, message: "Vui lòng chọn danh mục sản phẩm" },
            ]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={category || []}
            />
          </Form.Item> */}
          <Form.Item
            label="Đơn vị"
            name="unit"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={units || []}
            />
          </Form.Item>
          <Form.Item
            label="Tồn kho tối thiểu"
            name="minStock"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhập tồn kho tối thiểu",
              },
              {
                validator(_, value) {
                  console.log("valuee", value[0] == "0");

                  const includesNumber = ONLY_NUMBER.test(value);
                  if (!includesNumber) {
                    return Promise.resolve();
                  }
                  if (value[0] == "0") {
                    return Promise.reject("Vui lòng nhập tồn kho hợp lệ");
                  }
                  if (Number(value) < 0) {
                    return Promise.reject("Tồn kho không được nhỏ hơn 0");
                  }
                  return Promise.reject("Vui lòng chỉ nhập số");
                },
              },
            ]}
          >
            <Input defaultValue={""} />
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);

export default ProductFormModal;
