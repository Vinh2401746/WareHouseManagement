import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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
  Flex,
} from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import {
  getWarehousesApi,
  updateWarehousesApi,
} from "../../../../api/warehouse";
import { QueryKeys } from "../../../../constants/query-keys";
import { getSuppliersApi } from "../../../../api/supplier";
import {
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getProductsApi } from "../../../../api/products";
import { createInventoriesApi } from "../../../../api/inventory/inventory";
import { TableCommon } from "../../../../components/table/table";
import type { ColumnsType } from "antd/es/table";
import { v4 as UUID } from "uuid";
import { produce } from "immer";
import "./style.css";
import dayjs from "dayjs";
import { DISCOUNT_PERCENT, TAX_PERCENT } from "../../../../constants/common";
import { formatNumber } from "../../../../utils/helper";
export type WarehouseImExFormData = {
  warehouse: string;
  supplier: string;
  reason: string;
  deliveryPerson: string;
  items: any[];
  id?: string | null;
  discountMoney: number;
  taxMoney: number;
  totalAmount: number;
  totalAmountAfterFax: number;
};

export type UnitFormRef = {
  show: (data: Partial<WarehouseImExFormData>) => void;
  hide: () => void;
  onSuccessUnit?: () => void;
};

const initForm: WarehouseImExFormData = {
  warehouse: "",
  supplier: "",
  reason: "",
  deliveryPerson: "",
  items: [],
  discountMoney: 0,
  taxMoney: 0,
  totalAmount: 0,
  totalAmountAfterFax: 0,
};

type WarehouseFormModalProps = {
  onSuccessModal: () => void;
};

type Item = {
  product: any;
  unit: string;
  quantity: number;
  price: number;
  category: {
    name: string;
    code: string;
    id: string;
  };
  idPath: string;
  expiryDate: string;
  packaging: string;
  isTemplate?: boolean;
};

const ItemTemplate: Omit<Item, "idPath"> = {
  product: null,
  unit: "",
  quantity: 0,
  price: 0,
  category: {
    id: "",
    name: "",
    code: "",
  },
  isTemplate: true,
  expiryDate: "",
  packaging: "",
};
const WarehouseFormModal = forwardRef<UnitFormRef, WarehouseFormModalProps>(
  ({ onSuccessModal }, ref) => {
    const [open, setOpen] = useState(false);
    const [itemsData, setItemsData] = useState<Item[]>([
      {
        ...ItemTemplate,
        idPath: UUID(),
      },
    ]);
    const [errorRows, setErrorRows] = useState<string[]>([]);
    const [warehouseImEx, setWarehouseImEx] = useState<any>(initForm);
    const [form] = Form.useForm<WarehouseImExFormData>();
    const [calculateMoney, setCalculateMoney] = useState({
      totalAmount: 0,
      discountMoney: 0,
      taxMoney: 0,
      totalAmountAfterFax: 0,
    });

    useEffect(() => {
      //   Thành tiền = (SL × Đơn giá) × (1 − CK%) × (1 + Thuế%)
      //  A:tổng tiền = Sum ( thành tiền )

      // B: chiết khấu = tổng tiền  x %CK

      // C :thuế = tổng tiền * 8%

      // kết qủa =. A - B + C

      if (itemsData.filter((it) => it.product).length > 0) {
        // const total = Math.round(itemsData.filter(it =>it.product).reduce((item,currentValue)=>(Number(currentValue.quantity) * Number(currentValue.price)) + (Number(item?.quantity || 0) * Number(item?.price || 0)),0)) ;
        const total = Math.round(
          itemsData
            .filter((it) => it.product && it.price && it.quantity)
            .reduce(
              (prevValue, currentItem) =>
                prevValue +
                Number(currentItem?.quantity || 0) *
                  Number(currentItem?.price || 0),
              0,
            ),
        );
        const discount = Math.round(total * (DISCOUNT_PERCENT / 100));
        const tax = Math.round(total * (TAX_PERCENT / 100));
        setCalculateMoney({
          totalAmount: total || 0,
          discountMoney: discount,
          taxMoney: tax,
          totalAmountAfterFax: total - discount + tax,
        });
        // do anything
      }
    }, [errorRows, itemsData]);

    const renderTotalMoney = useCallback(() => {
      return (
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            display: "flex",
            justifyContent: "flex-end",
            rowGap: 8,
          }}
        >
          <div style={{ rowGap: 12, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                minWidth: 350,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 500 }}>Tạm tính</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {`${formatNumber(calculateMoney?.totalAmount || 0)}`} đ
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                minWidth: 350,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                Tổng chiết khấu
              </span>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#00a63e" }}>
                {`${formatNumber(calculateMoney?.discountMoney || 0)}`} đ
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                minWidth: 350,
                borderBottom: "1px solid #ebe6e7",
                paddingBottom: 12,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 500 }}>Tổng thuế</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#f54a00" }}>
                {`${formatNumber(calculateMoney?.taxMoney || 0)}`} đ
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                minWidth: 350,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 500 }}>Tổng cộng</span>
              <span style={{ fontSize: 20, fontWeight: 500, color: "#155dfc" }}>
                {`${formatNumber(calculateMoney?.totalAmountAfterFax || 0)}`} đ
              </span>
            </div>
          </div>
        </div>
      );
    }, [calculateMoney]);

    const { data } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getWarehousesApi({ page: 1, limit: 1000000000 });
      },
      // enabled: false
    });

    const warehouses = useMemo(
      () =>
        data?.results?.map((item: any) => ({
          value: item.id,
          label: `${item?.name || ""}-${item?.branch.name || ""}`,
        })),
      [data?.results],
    );

    const { data: supplierData } = useQuery({
      queryKey: [QueryKeys.warehouse.list],
      queryFn: () => {
        return getSuppliersApi({ page: 1, limit: 1000000000 });
      },
      // enabled: false
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
      // enabled: false
    });

    const products = useMemo(
      () =>
        productData?.results?.map((item: any) => ({
          ...item,
          value: item.id,
          label: `${item?.code}-${item?.name || ""}`,
        })),
      [productData?.results],
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
              }
            : initForm,
        );
        setWarehouseImEx(
          (data.id ? { ...data } : initForm) as WarehouseImExFormData,
        );
        setCalculateMoney({
          discountMoney: data.discountMoney,
          taxMoney: data.taxMoney,
          totalAmount: data.totalAmount,
          totalAmountAfterFax: data.totalAmount,
        });
        setItemsData(
          data.id && data.items?.length
            ? data.items.map((item: any) => ({ ...item, idPath: UUID() }))
            : [{ ...ItemTemplate, idPath: UUID() }],
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
          item.price <= 0 ||
          !item.expiryDate
        ) {
          invalidIds.push(item.idPath);
        }
      });

      setErrorRows(invalidIds);

      return invalidIds.length === 0;
    };

    const disableErrorRows = () => {
      if (errorRows.length > 0) return setErrorRows([]);
    };

    const onFinish = (values: WarehouseImExFormData) => {
      const isValid = validateItems();
      // console.log("temsData", itemsData)

      if (!isValid) {
        dispatchToast("warning", "Vui lòng kiểm tra lại các dòng sản phẩm");
        return;
      }
      mutate({
        ...values,
        items: itemsData.map((item) => ({
          productCode: item.product.code,

          productName: item.product?.name,

          unit: item.unit?.id || "",

          packaging: "fake",

          quantity: item.quantity,

          price: item.price,

          expiryDate: item.expiryDate,

          category: item.category.id,
        })),
        ...calculateMoney,
      });
    };

    const columns: ColumnsType = useMemo(
      () => [
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
          render: (_, item, index) => (
            <Select
              onFocus={disableErrorRows}
              showSearch
              options={products || []}
              onChange={(value, option: any) => {
                console.log("onChange", value, option);
                setItemsData(
                  produce((draft) => {
                    const itemToUpdate = draft.find(
                      (draftItem) => draftItem.idPath === item.idPath,
                    );
                    if (itemToUpdate) {
                      itemToUpdate.product = option;
                      ((itemToUpdate.unit = option?.unit ? option?.unit : null),
                        (itemToUpdate.category = option?.category
                          ? option?.category
                          : null));
                    }
                  }),
                );
              }}
              placeholder="Vui lòng chọn sản phẩm"
              defaultValue={itemsData?.[index]?.product?.id || ""}
              popupRender={(menu) => {
                return (
                  <>
                    <Button type="link">Thêm sản phẩm</Button>
                    {menu}
                  </>
                );
              }}
              style={{
                width: 200,
              }}
            />
          ),
          align: "center",
          width: 200,
        },
        {
          title: "Số lượng",
          dataIndex: "quantity",
          key: "quantity",
          render: (value, item, index) => (
            <Input
              onFocus={disableErrorRows}
              onBlur={(event) => {
                const newValue = Number(event.target.value);
                setItemsData(
                  produce((draft) => {
                    const itemToUpdate = draft.find(
                      (draftItem) => draftItem.idPath === item.idPath,
                    );
                    if (itemToUpdate) {
                      itemToUpdate.quantity = newValue;
                    }
                  }),
                );
              }}
              defaultValue={itemsData[index].quantity}
              onKeyDown={(e) => {
                if (["Backspace", "Delete", "Meta"].includes(e.key)) return;
                if (!/[0-9]/.test(e.key)) {
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
            />
          ),
          align: "center",
          width: 80,
        },
        {
          title: "Giá",
          dataIndex: "price",
          key: "price",
          render: (_, item, index) => (
            <Input
              onFocus={disableErrorRows}
              onKeyDown={(e) => {
                if (["Backspace", "Delete", "Meta"].includes(e.key)) return;
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Giá sản phẩm"
              inputMode="numeric"
              defaultValue={itemsData?.[index]?.price}
              onBlur={(event) => {
                const newValue = Number(event.target.value);
                setItemsData(
                  produce((draft) => {
                    const itemToUpdate = draft.find(
                      (draftItem) => draftItem.idPath === item.idPath,
                    );
                    if (itemToUpdate) {
                      itemToUpdate.price = newValue;
                    }
                  }),
                );
              }}
            />
          ),
          align: "center",
          width: 80,
        },
        {
          title: "Đơn vị",
          dataIndex: "unit",
          key: "unit",
          render: (value) => `${value?.name || ""}${value?.code || ""}`,
          // render: (_, __, index) => <Select
          //   options={units || []}
          //   placeholder="Vui lòng chọn đơn vị"
          // />,
          align: "center",
          width: 80,
        },
        // {
        //   title: "Quy cách đóng",
        //   dataIndex: "packaging",
        //   key: "packaging",
        //   render: (_, item) => <Input
        //     onFocus={disableErrorRows} placeholder="Vui lòng nhập quy cách"
        //     onChange={(e) => {
        //       const newValue = e.target.value
        //       setItemsData(produce((draft) => {
        //         const itemToUpdate = draft.find((draftItem) => draftItem.idPath === item.idPath);
        //         if (itemToUpdate) {
        //           itemToUpdate.packaging = newValue;
        //         }
        //       }));
        //     }}
        //   />,
        //   align: "center",
        //   width: 80,
        // },
        {
          title: "Ngày hết hạn",
          dataIndex: "expiryDate",
          key: "expiryDate",
          render: (_, item, index) => (
            <DatePicker
              onFocus={disableErrorRows}
              format={"YYYY-MM-DD"}
              defaultValue={itemsData?.[index]?.expiryDate}
              onChange={(date) => {
                const newValue = dayjs(date).format("YYYY-MM-DD");
                setItemsData(
                  produce((draft) => {
                    const itemToUpdate = draft.find(
                      (draftItem) => draftItem.idPath === item.idPath,
                    );
                    if (itemToUpdate) {
                      itemToUpdate.expiryDate = newValue;
                    }
                  }),
                );
              }}
            />
          ),
          align: "center",
          width: 100,
        },
        {
          title: "Danh mục",
          dataIndex: "category",
          key: "category",
          render: (value) => `${value?.name || "" + value?.code || ""}`,
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
          render: (_, __, index) => (
            <Row justify={"center"} gutter={8}>
              <Col>
                <Tag
                  onClick={() =>
                    setItemsData((prev) => [
                      ...prev,
                      {
                        ...ItemTemplate,
                        idPath: UUID(),
                      },
                    ])
                  }
                  style={{
                    cursor: "pointer",
                  }}
                  key={"green"}
                  color={"green"}
                  variant={"filled"}
                >
                  <PlusOutlined style={{ fontSize: 22 }} />
                </Tag>
              </Col>

              <Col>
                <Tag
                  onClick={() => {
                    if (itemsData.length === 1) return;
                    setItemsData((prev) => prev.filter((_, i) => i !== index));
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                  key={"red"}
                  color={"red"}
                  variant={"filled"}
                >
                  <MinusOutlined style={{ fontSize: 22 }} />
                </Tag>
              </Col>
            </Row>
          ),
          align: "center",
          width: 120,
        },
      ],
      [disableErrorRows, itemsData, products],
    );


    const onCloseModal = () =>{
      setOpen(false)
      setCalculateMoney({
          totalAmount: 0,
          discountMoney: 0,
          taxMoney: 0,
          totalAmountAfterFax: 0,
        });
        setItemsData([]);
        form.resetFields();
        setErrorRows([]);
    }
    return (
      <Modal
        open={open}
        // title="Nhập kho"
        onCancel={onCloseModal}
        // onOk={() => form.submit()}
        // onOk={() => onFinish({})}
        // destroyOnHidden
        title={`${!isUpdate ? "Tạo" : "Cập nhật"}`}
        // cancelText="Đóng"
        
        footer={false}
        width={"80%"}
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
                rules={[
                  { required: true, message: "Vui lòng chọn nhà cung cấp" },
                ]}
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
                rules={[
                  { required: true, message: "Vui lòng nhập người vận chuyển" },
                ]}
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
            rowKey={"id"}
            dataSource={itemsData}
            rowClassName={
              (record) => {
                return errorRows.includes(record.idPath) ? "error-row" : "";
              }
              // errorRows.includes(record.idPath) ? "error-row" : ""
            }
          />
          {renderTotalMoney()}
          <Flex justify="end" gap={12}>
            <Button htmlType="reset" onClick={onCloseModal}>
              Đóng
            </Button>
            <Button htmlType="submit" type="primary">
             {!isUpdate ? "Tạo" : "Cập nhật"}
            </Button>
          </Flex>
        </Form>
      </Modal>
    );
  },
);

export default WarehouseFormModal;
