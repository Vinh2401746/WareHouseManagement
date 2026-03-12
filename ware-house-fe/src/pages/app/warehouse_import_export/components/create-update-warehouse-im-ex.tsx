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
  Tag,
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
import { MinusCircleOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { getCategorysApi } from "../../../../api/category";
import { getProductsApi } from "../../../../api/products";
import { createInventoriesApi } from "../../../../api/inventory/inventory";
import { TableCommon } from "../../../../components/table/table";
import type { ColumnsType } from "antd/es/table";
import { v4 as UUID } from 'uuid';
import { produce } from 'immer';
import './style.css'
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

type Item = {
  product: string,
  unit: string,
  quantity: number,
  price: number,
  category: object
  isTemplate?: boolean,
  idPath: string
}

const ItemTemplate: Omit<Item, 'idPath'> = {
  product: '',
  unit: '',
  quantity: 0,
  price: 0,
  category: {
    id: '',
    name: ''
  },
  isTemplate: true
}
const WarehouseFormModal = forwardRef<UnitFormRef, WarehouseFormModalProps>(
  ({ onSuccessModal }, ref) => {
    const [open, setOpen] = useState(false);
    const [itemsData, setItemsData] = useState<Item[]>([{
      ...ItemTemplate,
      idPath: UUID()
    }])
    const [errorRows, setErrorRows] = useState<string[]>([]);
    const [warehouseImEx, setWarehouseImEx] =
      useState<any>(initForm);
    const [form] = Form.useForm<WarehouseImExFormData>();

    const { data } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getWarehousesApi({ page: 1, limit: 1000000000 });
      },
      enabled: false
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
      enabled: false
    });

    const suppliers = useMemo(
      () =>
        supplierData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name}-${item?.branch.name || ""}`,
        })),
      [supplierData?.results],
    );



    const { data: productData } = useQuery({
      queryKey: [QueryKeys.products.list],
      queryFn: () => {
        return getProductsApi({ page: 1, limit: 1000000000 });
      },
      enabled: false
    });

    const products = useMemo(
      () =>
        productData?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.code}-${item?.name || ""}`,
        })),
      [productData?.results],
    );



    const isUpdate = useMemo(() => warehouseImEx.id, [warehouseImEx.id]);
    useImperativeHandle(ref, () => ({
      show: (data: WarehouseImExFormData | any) => {
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
          : createInventoriesApi(payload);
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

    const validateItems = () => {
      const invalidIds: string[] = [];

      itemsData.forEach((item) => {
        if (
          !item.product ||
          !item.quantity ||
          item.quantity <= 0 ||
          !item.price ||
          item.price <= 0
        ) {
          invalidIds.push(item.idPath);
        }
      });

      setErrorRows(invalidIds);

      return invalidIds.length === 0;
    };

    const disableErrorRows = () => {
      if (errorRows.length > 0) return setErrorRows([])
    }

    const onFinish = (values: WarehouseImExFormData) => {
      const isValid = validateItems();
      console.log("temsData", itemsData)

      if (!isValid) {
        dispatchToast("warning", "Vui lòng kiểm tra lại các dòng sản phẩm");
        return;
      }
      mutate(values);
    };

    const columns: ColumnsType = [
      {
        title: "STT",
        dataIndex: "id",
        key: "id",
        render: (_, __, index) => index + 1,
        align: "center",
        width: 20,
      },
      {
        title: "Sản phẩm",
        dataIndex: "product",
        key: "id",
        render: () => <Select
          onFocus={disableErrorRows}
          showSearch
          options={products || []}
          onChange={(value) => {
            console.log(value)
          }}
          placeholder="Vui lòng chọn sản phẩm"
          popupRender={(menu) => {
            return <>
              <Button type="link">Thêm sản phẩm</Button>
              {menu}
            </>
          }}
        />,
        align: "center",
        width: 80,
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (value, item, index) => <Input
          onFocus={disableErrorRows}
          onBlur={(event) => {
            const newValue = Number(event.target.value);
            setItemsData(produce((draft) => {
              const itemToUpdate = draft.find((draftItem) => draftItem.idPath === item.idPath);
              if (itemToUpdate) {
                itemToUpdate.quantity = newValue;
              }
            }));
          }}
          onKeyDown={(e) => {
             if(['Backspace', 'Delete', 'Meta' ].includes(e.key)) return ;
             if (!/[0-9]/.test(e.key) ) {
              e.preventDefault();
            }
          }}
          // onChange={(e) => {
          //   const value = e.target.value.replace(/\D/g, ""); // chỉ giữ số
          //   console.log("value", value)
          //   e.target.value = value;
          // }}
          placeholder="Số lượng"
          inputMode="numeric"

        // value={value}
        />,
        align: "center",
        width: 80,
      },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        render: (_, item, index) => <Input
          onFocus={disableErrorRows}
          onKeyDown={(e) => {
             if(['Backspace', 'Delete', 'Meta' ].includes(e.key)) return ;
             if (!/[0-9]/.test(e.key) ) {
              e.preventDefault();
            }
          }}
          placeholder="Giá sản phẩm"
          inputMode="numeric"
          onBlur={(event) => {
            const newValue = Number(event.target.value);
            setItemsData(produce((draft) => {
              const itemToUpdate = draft.find((draftItem) => draftItem.idPath === item.idPath);
              if (itemToUpdate) {
                itemToUpdate.price = newValue;
              }
            }));
          }}
        />,
        align: "center",
        width: 80,
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        // render: (_, __, index) => <Select
        //   options={units || []}
        //   placeholder="Vui lòng chọn đơn vị"
        // />,
        align: "center",
        width: 80,
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        // render: () => <Select
        //                       options={categories || []}
        //                       placeholder="Vui lòng chọn danh mục"
        //                     />,
        align: "center",
        width: 80,
      },
      {
        title: "Tuỳ chọn",
        dataIndex: "",
        key: "",
        render: (_, __, index) => <Row justify={'center'} gutter={8}>
          <Col>
            <Tag onClick={() =>
              setItemsData((prev) => [...prev, {
                ...ItemTemplate,
                idPath: UUID()
              }])
            } style={{
              cursor: 'pointer'
            }} key={'green'} color={'green'} variant={'filled'}>
              <PlusOutlined style={{ fontSize: 22 }} />
            </Tag>

          </Col>

          <Col>

            <Tag onClick={() => {
              if (itemsData.length === 1) return;
              setItemsData((prev) => prev.filter((_, i) => i !== index))
            }} style={{
              cursor: 'pointer'
            }} key={'red'} color={'red'} variant={'filled'}>
              <MinusOutlined style={{ fontSize: 22 }} />
            </Tag>
          </Col>

        </Row>,
        align: "center",
        width: 120,
      },
    ]
    console.log("123")
    return (
      <Modal
        open={open}
        title="Nhập kho"
        onCancel={() => setOpen(false)}
        // onOk={() => form.submit()}
        onOk={() => onFinish({})}
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
          <Row gutter={8}>

            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={8}>

            <Col span={12}>
              <Form.Item
                label="Người vận chuyển"
                name="deliveryPerson"
                rules={[{ required: true, message: "Vui lòng nhập người vận chuyển" }]}
              >
                <Input maxLength={24} />
              </Form.Item>
            </Col>
            <Col span={12}>

              <Form.Item
                label="Lý do"
                name="reason"
                rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
              >
                <Input maxLength={200} />
              </Form.Item>
            </Col>
          </Row>
          <TableCommon
            columns={columns}
            rowKey={'id'}
            dataSource={itemsData}
            rowClassName={(record) => {
              return errorRows.includes(record.idPath) ? "error-row" : ""
            }
              // errorRows.includes(record.idPath) ? "error-row" : ""
            }
          />

        </Form>
      </Modal>
    );
  },
);

export default WarehouseFormModal;
