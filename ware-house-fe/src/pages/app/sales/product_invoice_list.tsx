import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Button, Col, DatePicker, Flex, Form, Image, Input, Row, Tag } from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import {
  DISCOUNT_PERCENT,
  ROOT_IMAGE_IMAGE,
  TAX_PERCENT,
} from "../../../constants/common";
import { formatNumber } from "../../../utils/helper";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import dispatchToast from "../../../constants/toast";

export type InvoiceItem = {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  price: number;
  totalStock:number
};

export type ProductInvoiceListRef = {
  addProduct: (product: {
    id: string;
    name: string;
    code: string;
    imageUrl?: string;
    price?: number;
    totalStock?: number;
  }) => void;
  getItems: () => InvoiceItem[];
  clearItems: () => void;
};

type Props = {
  removeFromList?: (id: string) => void;
  removeAllFromList?: () => void;
};

type FormSale = {
  note: string
  saleDate: Date
  customerName: string
  discountPercent: number
}

export const ProductInvoiceList = forwardRef<ProductInvoiceListRef, Props>(
  ({ removeFromList, removeAllFromList }, ref) => {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [form] = useForm<FormSale>()
    const discountPercent = Form.useWatch("discountPercent", form) ?? 0;



    const finalMoney = useMemo(() => {
      const total = Math.round(
        items.reduce(
          (prevValue, currentItem) =>
            prevValue +
            Number(currentItem?.quantity || 0) *
            Number(currentItem?.price || 0),
          0,
        ),
      );
      const discount = Math.round(total * (discountPercent / 100));
      const tax = Math.round(total * (TAX_PERCENT / 100));

      // console.log("render",items)
      return {
        totalAmount: total || 0,
        discountMoney: discount,
        taxMoney: tax,
        totalAmountAfterFax: total - discount + tax,
      }

    }, [items,discountPercent])

    useImperativeHandle(
      ref,
      () => ({
        addProduct(product) {
          setItems((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) {
              if (exists.quantity +  1 > exists.totalStock) {
                dispatchToast("warning", "Số lượng không được vượt quá tồn kho");
                return prev;
              }
              return prev.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              );
            }
            return [
              ...prev,
              {
                id: product.id,
                name: product.name,
                code: product.code,
                imageUrl: product.imageUrl ?? "",
                quantity: 1,
                price: product.price ?? 0,
                totalStock: product.totalStock ?? 0,
              },
            ];
          });
        },
        getItems: () => items,
        clearItems: () => setItems([]),
      }),
      [items],
    );

    const handleIncrease = (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        if (item.quantity + 1 > item.totalStock) {
          dispatchToast("warning", "Số lượng không được vượt quá tồn kho");
          return prev;
        }
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
      });
    };

    const handleDecrease = (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        if (item.quantity <= 1) {
          removeFromList?.(id);
          return prev.filter((i) => i.id !== id);
        }
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        );
      });
    };

    const handlePriceBlur = (id: string, value: string) => {
      const price = Number(value.replace(/[^0-9]/g, ""));
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, price } : i))
      );
    };

    const handleRemove = (id: string) => {
      removeFromList?.(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    };
    const renderTotalMoney = useCallback(() => {
      return (
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            display: "flex",
            justifyContent: "flex-end",
            rowGap: 8,
            flexDirection: "column",
          }}
        >
          {/* <div style={{ rowGap: 12, display: "flex", flexDirection: "column" }}> */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tạm tính</span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {`${formatNumber(finalMoney?.totalAmount || 0)}`} đ
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              Tổng chiết khấu
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#00a63e" }}>
              {`${formatNumber(finalMoney?.discountMoney || 0)}`} đ
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: 200,
              borderBottom: "1px solid #ebe6e7",
              paddingBottom: 12,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tổng thuế (VAT)</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#f54a00" }}>
              {`${formatNumber(finalMoney?.taxMoney || 0)}`} đ
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 500 }}>Tổng cộng</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: "#155dfc" }}>
              {`${formatNumber(finalMoney?.totalAmountAfterFax || 0)}`} đ
            </span>
          </div>
          {/* </div> */}
        </div>
      );
    }, [finalMoney?.discountMoney, finalMoney?.taxMoney, finalMoney?.totalAmount, finalMoney?.totalAmountAfterFax]);

    const renderForm = useCallback(() => {

      return (
        <Form form={form} initialValues={{
          saleDate: dayjs(new Date()),
          customerName: '',
          discountPercent: 0,
          note: '',
        }}>
          <Form.Item name={"customerName"}>
            <Input placeholder="Nhập tên khách hàng" ></Input>
          </Form.Item>
          {/* <Form.Item name={"saleDate"}>
            <DatePicker style={{ width: '100%' }} placeholder="Ngày bán hàng" format={"DD/MM/YYYY"} ></DatePicker>
          </Form.Item> */}
          <Form.Item name="discountPercent">
            <Input type={"number"} placeholder="Giảm giá" suffix={"%"}></Input>
          </Form.Item>
          <Form.Item name={"note"}>
            <Input placeholder="Ghi chú" ></Input>
          </Form.Item>
        </Form>
      )
    }, [])

    return (
      <Row gutter={[24, 24]} style={{ flexDirection: "column" }}>
        {items.length === 0 && (
          <Col span={24}>
            <Flex vertical align="center" gap={12} style={{ padding: "32px 0" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "#e8f0fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 48, color: "#1677ff" }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#222" }}>Giỏ hàng trống</span>
              <span style={{ fontSize: 14, color: "#888" }}>Chưa có sản phẩm nào được chọn.</span>
            </Flex>
          </Col>
        )}
        {items.map((item) => (
          <Col key={item.id}>
            <Row gutter={8} align="middle">
              <Col>
                <Image
                  width={50}
                  height={50}
                  alt=""
                  src={item?.imageUrl ? `${ROOT_IMAGE_IMAGE}${item?.imageUrl}` : 'https://images.pexels.com/photos/16211537/pexels-photo-16211537.jpeg'}
                />
              </Col>
              <Col flex={1}>
                <Flex vertical gap={6}>
                  <span>{item.name}</span>
                  <Flex gap={4} align="center">
                    <Tag
                      color="red"
                      variant="outlined"
                      style={{ width: 28, justifyContent: "center", display: "flex", cursor: "pointer" }}
                      onClick={() => handleDecrease(item.id)}
                    >
                      −
                    </Tag>
                    <span style={{ minWidth: 20, textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <Tag
                      color="green"
                      variant="outlined"
                      style={{ width: 28, justifyContent: "center", display: "flex", cursor: "pointer" }}
                      onClick={() => handleIncrease(item.id)}
                    >
                      +
                    </Tag>
                    <Input
                      defaultValue={item.price}
                      style={{ width: 110 }}
                      suffix="đ"
                      onBlur={(e) => handlePriceBlur(item.id, e.target.value)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(item.id)}
                    />
                  </Flex>
                </Flex>
              </Col>
            </Row>
          </Col>
        ))}


        {renderForm()}
        {renderTotalMoney()}

          <Flex gap={8} justify="space-between">
            <Button
              danger
              type="primary"
              style={{ background: "#e03131" }}
              onClick={() => {
                removeAllFromList?.();
                setItems([]);
              }}
            >
              Hủy đơn
            </Button>
            <Button
              type="primary"
              style={{ background: "#2f9e44", flex: 1 }}
              onClick={() => dispatchToast("warning", "Tính năng đang phát triển")}
            >
              Tính tiền
            </Button>
          </Flex>
      </Row>
    );
  },
);
