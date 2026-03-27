import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Button, Col, Flex, Image, Input, Row, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  DISCOUNT_PERCENT,
  ROOT_IMAGE_IMAGE,
  TAX_PERCENT,
} from "../../../constants/common";
import { formatNumber } from "../../../utils/helper";

export type InvoiceItem = {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  price: number;
};

export type ProductInvoiceListRef = {
  addProduct: (product: {
    id: string;
    name: string;
    code: string;
    imageUrl?: string;
    price?: number;
  }) => void;
  getItems: () => InvoiceItem[];
  clearItems: () => void;
};

type Props = {
  removeFromList?: (id: string) => void;
};

export const ProductInvoiceList = forwardRef<ProductInvoiceListRef, Props>(
  ({ removeFromList }, ref) => {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    // const [calculateMoney, setCalculateMoney] = useState({
    //   totalAmount: 0,
    //   discountMoney: 0,
    //   taxMoney: 0,
    //   totalAmountAfterFax: 0,
    // });

    useEffect(() => {
      //   Thành tiền = (SL × Đơn giá) × (1 − CK%) × (1 + Thuế%)
      //  A:tổng tiền = Sum ( thành tiền )

      // B: chiết khấu = tổng tiền  x %CK

      // C :thuế = tổng tiền * 8%

      // kết qủa =. A - B + C

        // const total = Math.round(items.filter(it =>it.product).reduce((item,currentValue)=>(Number(currentValue.quantity) * Number(currentValue.price)) + (Number(item?.quantity || 0) * Number(item?.price || 0)),0)) ;
        // const total = Math.round(
        //   items.reduce(
        //     (prevValue, currentItem) =>
        //       prevValue +
        //       Number(currentItem?.quantity || 0) *
        //         Number(currentItem?.price || 0),
        //     0,
        //   ),
        // );
        // const discount = Math.round(total * (DISCOUNT_PERCENT / 100));
        // const tax = Math.round(total * (TAX_PERCENT / 100));

        // // console.log("render",items)
        // setCalculateMoney({
        //   totalAmount: total || 0,
        //   discountMoney: discount,
        //   taxMoney: tax,
        //   totalAmountAfterFax: total - discount + tax,
        // });
        // do anything
      
    }, []);

    const finalMoney  = useMemo(()=> {
           const total = Math.round(
          items.reduce(
            (prevValue, currentItem) =>
              prevValue +
              Number(currentItem?.quantity || 0) *
                Number(currentItem?.price || 0),
            0,
          ),
        );
        const discount = Math.round(total * (DISCOUNT_PERCENT / 100));
        const tax = Math.round(total * (TAX_PERCENT / 100));

        // console.log("render",items)
        return {
          totalAmount: total || 0,
          discountMoney: discount,
          taxMoney: tax,
          totalAmountAfterFax: total - discount + tax,
        }

    },[items])

    useImperativeHandle(
      ref,
      () => ({
        addProduct(product) {
        //   console.log("log==", { product, items });
          setItems((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) {
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
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
      );
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
    };    const renderTotalMoney = useCallback(() => {
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
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tổng thuế</span>
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

    return (
      <Row gutter={[24, 24]} style={{ padding: 20, flexDirection: "column" }}>
        {items.length === 0 && (
          <Col
            span={24}
            style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}
          >
            Chọn sản phẩm từ danh sách bên trái
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
                  src={`${ROOT_IMAGE_IMAGE}${item.imageUrl}`}
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
        {renderTotalMoney()}
      </Row>
    );
  },
);
