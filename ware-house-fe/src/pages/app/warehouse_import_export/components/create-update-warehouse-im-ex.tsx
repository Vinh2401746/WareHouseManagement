import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
  Row,
  Col,
} from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import {
  createWarehouseApi,
  getWarehousesApi,
  updateWarehousesApi,
} from "../../../../api/warehouse";
import { QueryKeys } from "../../../../constants/query-keys";
import { getSuppliersApi } from "../../../../api/supplier";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getCategorysApi } from "../../../../api/category";
import { getProductsApi } from "../../../../api/products";

export type WarehouseImExFormData = {
  warehouse: string;
  supplier: string;
  reason: string;
  deliveryPerson: string;
  items: any[];
  id?: string | null;
};

export type UnitFormRef = {
  show: (
    data: Partial<WarehouseImExFormData>,
  ) => void;
  hide: () => void;
  onSuccessUnit?: () => void;
};

const initForm: WarehouseImExFormData = {
  warehouse: "",
  supplier: "",
  reason: "",
  deliveryPerson: "",
  items: [],
};

type WarehouseFormModalProps = {
  onSuccessModal: () => void;
};
const WarehouseFormModal = forwardRef<UnitFormRef, WarehouseFormModalProps>(
  ({ onSuccessModal }, ref) => {
    const [open, setOpen] = useState(false);
    const [warehouseImEx, setWarehouseImEx] =
      useState<any>(initForm);
    const [form] = Form.useForm<WarehouseImExFormData>();

    const { data } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getWarehousesApi({ page: 1, limit: 1000000000 });
      },
    });

    const warehouses = useMemo(
      () =>
        data?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name || ''}-${item?.branch.name || ""}`,
        })),
      [data?.results],
    );

    const { data: supplierData } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getSuppliersApi({ page: 1, limit: 1000000000 });
      },
    });

    const suppliers = useMemo(
      () =>
        supplierData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name}-${item?.branch.name || ""}`,
        })),
      [supplierData?.results],
    );

    const { data: categoryData } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getCategorysApi({ page: 1, limit: 1000000000 });
      },
    });

    const categories = useMemo(
      () =>
        categoryData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name}-${item?.branch.name || ""}`,
        })),
      [categoryData?.results],
    );

    const { data: productData } = useQuery({
      queryKey: [QueryKeys.products.list],
      queryFn: () => {
        return getProductsApi({ page: 1, limit: 1000000000 });
      },
    });

    const products = useMemo(
      () =>
        productData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.code}-${item?.name || ""}`,
        })),
      [productData?.results],
    );

     const { data: unitData } = useQuery({
      queryKey: [QueryKeys.unit.list],
      queryFn: () => {
        return getProductsApi({ page: 1, limit: 1000000000 });
      },
    });

    const units = useMemo(
      () =>
        unitData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.code}-${item?.name || ""}`,
        })),
      [unitData?.results],
    );


    const isUpdate = useMemo(() => warehouseImEx.id, [warehouseImEx.id]);
    useImperativeHandle(ref, () => ({
      show: (data: WarehouseImExFormData | any) => {
        console.log("data", data);
        setOpen(true);
        form.setFieldsValue(
          data.id
            ? {
                ...data,
                warehouse: data?.warehouse?.id || "",
                supplier: data?.supplier?.id || "",
                items: data?.items.map((item: any) => ({
                  ...item,
                  productCode: item?.product?.id || "",
                  unit: item?.unit?.id || "",
                  category: item?.category?.id || "",
                })) || [],
              }
            : initForm,
        );
        setWarehouseImEx(
          (data.id ? { ...data } : initForm) as WarehouseImExFormData,
        );
      },
      hide: () => {
        setOpen(false);
        form.resetFields();
        setWarehouseImEx(initForm as WarehouseImExFormData);
      },
    }));

    const { mutate } = useMutation({
      mutationFn: (payload: WarehouseImExFormData) => {
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

    const onFinish = (values: WarehouseImExFormData) => {
      mutate(values);
    };

    return (
      <Modal
        open={open}
        title="Chi tiết"
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        // destroyOnHidden
        okText={`${!isUpdate ? "Tạo" : "Cập nhật"}`}
        cancelText="Đóng"
        width={'70%'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initForm}
        >
          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item
            label="Kho"
            name="warehouse"
            rules={[{ required: true, message: "Vui lòng chọn kho" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={warehouses || []}
            />
          </Form.Item>
          <Form.Item
            label="Nhà cung cấp"
            name="supplier"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={suppliers || []}
            />
          </Form.Item>

          <Form.Item
            label="Người chuyển"
            name="deliveryPerson"
            rules={[{ required: true, message: "Vui lòng nhập người chuyển" }]}
          >
            <Input maxLength={24} />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    style={{
                      paddingBottom: 8,
                      paddingTop: 8,
                      borderTop: "1px solid #ccc",
                      borderBottom: "1px solid #ccc",
                    }}
                    justify={"space-between"}
                    align={"middle"}
                    gutter={8}
                  >
                    <Col span={23}>
                      <Row gutter={8}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, "productCode"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn sản phẩm",
                              },
                            ]}
                          >
                          <Select
                            options={products || []}
                            placeholder="Vui lòng chọn sản phẩm"
                          />
                            {/* <Input placeholder="Mã sản phẩm" /> */}
                          </Form.Item>
                        </Col>
               
                      </Row>

                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "unit"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn đơn vị",
                              },
                            ]}
                          >
                            <Select
                              options={units || []}
                              placeholder="Vui lòng chọn đơn vị"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "package"]}
                            rules={[{ required: true, message: "Gói" }]}
                          >
                            <Input placeholder="Vui lòng nhập gói sản phẩm" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập số lượng",
                              },
                            ]}
                          >
                            <Input placeholder="Số lượng" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giá sản phẩm",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Giá sản phẩm"
                              inputMode="numeric"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "expiryDate"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn ngày hết hạn",
                              },
                            ]}
                          >
                            <DatePicker
                              placeholder="Ngày hết hạn"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "category"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn danh mục",
                              },
                            ]}
                          >
                            <Select
                              options={categories || []}
                              placeholder="Vui lòng chọn danh mục"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>

                    <Col span={1}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
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
