import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Button, Col, Flex, Form, Image, Input, Modal, Row, Segmented, Tag, Select, Spin } from "antd";
import { DeleteOutlined, PrinterOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import {
  TAX_PERCENT,
  ROOT_IMAGE_IMAGE,
} from "../../../constants/common";
import { formatNumber } from "../../../utils/helper";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import dispatchToast from "../../../constants/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvoiceApi } from "../../../api/sales";
import { getCustomersApi } from "../../../api/customer";
import { useAppSelector } from "../../../store/hooks";


export type InvoiceItem = {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  price: number;
  totalStock: number
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
  warehouseId: string;
  removeFromList?: (id: string) => void;
  onCancel?: () => void;
};

type FormSale = {
  note: string
  saleDate: Date
  customerId: string
  customerName: string
  discountPercent: number
}

export const ProductInvoiceList = forwardRef<ProductInvoiceListRef, Props>(
  ({ removeFromList, onCancel, warehouseId }, ref) => {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [form] = useForm<FormSale>()
    const discountPercent = Form.useWatch("discountPercent", form) || 0;
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"Tiền mặt" | "Chuyển khoản">("Tiền mặt");
    const [customerPaid, setCustomerPaid] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>("");

    const branchId = useAppSelector((state) => state.user.user.branch?.id);

    // Customer search state
    const [customerKeyword, setCustomerKeyword] = useState("");
    const { data: customerData, isFetching: fetchingCustomers } = useQuery({
      queryKey: ["customers", customerKeyword],
      queryFn: () => getCustomersApi({ limit: 20, page: 1, name: customerKeyword }),
    });

    const finalMoney = useMemo(() => {
      const total = Math.round(
        items.reduce(
          (prev, item) => prev + Number(item.quantity) * Number(item.price),
          0,
        ),
      );
      const discount = Math.round(total * (discountPercent / 100));
      const tax = Math.round(total * (TAX_PERCENT / 100));

      return {
        totalAmount: total || 0,
        discountMoney: discount,
        taxMoney: tax,
        totalAmountAfterFax: total - discount + tax,
      }
    }, [items, discountPercent])

    useImperativeHandle(
      ref,
      () => ({
        addProduct(product) {
          setItems((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) {
              if (exists.quantity + 1 > exists.totalStock) {
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

    const validateItems = useCallback(() => {
      if (!warehouseId) {
        dispatchToast("warning", "Vui lòng chọn Kho xuất hàng ở bên trái");
        return false;
      }
      if (items.length === 0) {
        dispatchToast("warning", "Vui lòng chọn ít nhất một sản phẩm");
        return false;
      }
      const hasInvalidPrice = items.some((i) => !i.price || i.price <= 0);
      if (hasInvalidPrice) {
        dispatchToast("warning", "Vui lòng nhập giá > 0 cho tất cả sản phẩm");
        return false;
      }
      return true;
    }, [warehouseId, items]);

    const handleOpenCheckout = useCallback(() => {
      if (!validateItems()) return;
      if (!finalMoney.totalAmount || (!finalMoney.totalAmountAfterFax && finalMoney.totalAmountAfterFax !== 0)) {
        dispatchToast("warning", "Tổng tiền không hợp lệ");
        return;
      }
      setCustomerPaid(finalMoney.totalAmountAfterFax);
      setCreatedAt(dayjs().format("HH:mm:ss DD/M/YYYY"));
      setCheckoutVisible(true);
    }, [validateItems, finalMoney]);

    const renderTotalMoney = useCallback(() => {
      return (
        <div style={{ marginTop: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tạm tính</span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{`${formatNumber(finalMoney?.totalAmount || 0)}`} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tổng chiết khấu</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#00a63e" }}>{`${formatNumber(finalMoney?.discountMoney || 0)}`} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ebe6e7", paddingBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Tổng thuế (VAT)</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#f54a00" }}>{`${formatNumber(finalMoney?.taxMoney || 0)}`} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 20, fontWeight: 500 }}>Tổng cộng</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: "#155dfc" }}>{`${formatNumber(finalMoney?.totalAmountAfterFax || 0)}`} đ</span>
          </div>
        </div>
      );
    }, [finalMoney]);

    const renderForm = useCallback(() => {
      return (
        <Form form={form} initialValues={{
          saleDate: dayjs(new Date()),
          customerId: null,
          customerName: '',
          discountPercent: 0,
          note: '',
        }}>
          <Form.Item name="customerId" style={{ marginBottom: 12 }}>
            <Select
              allowClear
              showSearch
              placeholder="🔍 Chọn khách hàng..."
              notFoundContent={fetchingCustomers ? <Spin size="small" /> : null}
              onSearch={setCustomerKeyword}
              onChange={(val, opt: any) => {
                form.setFieldValue('customerName', opt ? opt.label : '');
              }}
              filterOption={false}
              options={(customerData?.results || []).map((c: any) => ({
                label: `${c.name} - ${c.phone}`,
                value: c.id
              }))}
            />
          </Form.Item>
          {/* Hidden field cho tên tự nhập nếu không chọn từ dropdown */}
          <Form.Item name="customerName" style={{ marginBottom: 12 }}>
            <Input placeholder="Hoặc nhập tên khách vãng lai..." />
          </Form.Item>

          <Form.Item name="discountPercent" style={{ marginBottom: 12 }}>
            <Input type="number" placeholder="Giảm giá" suffix="%" />
          </Form.Item>
          <Form.Item name="note" style={{ marginBottom: 12 }}>
            <Input placeholder="Ghi chú" />
          </Form.Item>
        </Form>
      )
    }, [customerData, fetchingCustomers, form])


    const { mutate, isPending } = useMutation({
      mutationFn: createInvoiceApi,
      onSuccess: () => {
        dispatchToast("success", "Tạo hoá đơn thành công!");
        setCheckoutVisible(false);
        setItems([]);
        onCancel?.();
        form.resetFields();
      },
      onError: (e: any) => {
        dispatchToast("error", e?.message || "Tạo hoá đơn thất bại!");
      }
    })

    const handleSaveDraft = useCallback(() => {
      if (!validateItems()) return;
      mutate({
        customer: form.getFieldValue('customerId') || undefined,
        customerName: form.getFieldValue('customerName') || "Khách vãng lai",
        saleDate: form.getFieldValue('saleDate') || new Date(),
        note: form.getFieldValue('note') || '',
        status: 'DRAFT',
        discountMoney: finalMoney.discountMoney,
        taxMoney: finalMoney.taxMoney,
        paidAmount: 0, // Lưu nháp thì chưa tính tiền
        items: items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        warehouse: warehouseId,
        branch: branchId
      });
    }, [validateItems, form, items, warehouseId, branchId, mutate, finalMoney]);

    const handleCreateInvoice = useCallback(() => {
      mutate({
        customer: form.getFieldValue('customerId') || undefined,
        customerName: form.getFieldValue('customerName') || "Khách vãng lai",
        saleDate: form.getFieldValue('saleDate') || new Date(),
        note: form.getFieldValue('note') || '',
        status: 'COMPLETED',
        discountMoney: finalMoney.discountMoney,
        taxMoney: finalMoney.taxMoney,
        paidAmount: customerPaid,
        items: items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        warehouse: warehouseId,
        branch: branchId
      });
    }, [form, items, warehouseId, branchId, mutate, finalMoney, customerPaid]);

    return (
      <>
        <Row gutter={[24, 24]} style={{ flexDirection: "column" }}>
          {items.length === 0 && (
            <Col span={24}>
              <Flex vertical align="center" gap={12} style={{ padding: "32px 0" }}>
                <div
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center",
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
                    width={50} height={50} alt=""
                    src={item?.imageUrl ? `${ROOT_IMAGE_IMAGE}${item?.imageUrl}` : 'https://images.pexels.com/photos/16211537/pexels-photo-16211537.jpeg'}
                  />
                </Col>
                <Col flex={1}>
                  <Flex vertical gap={6}>
                    <span>{item.name}</span>
                    <Flex gap={4} align="center">
                      <Tag
                        color="red" variant="outlined"
                        style={{ width: 28, justifyContent: "center", display: "flex", cursor: "pointer" }}
                        onClick={() => handleDecrease(item.id)}
                      >
                        −
                      </Tag>
                      <span style={{ minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <Tag
                        color="green" variant="outlined"
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
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(item.id)} />
                    </Flex>
                  </Flex>
                </Col>
              </Row>
            </Col>
          ))}

          {renderForm()}
          {renderTotalMoney()}

          <Flex gap={8} justify="space-between" align="center">
            <Button
              danger
              type="primary"
              style={{ background: "#e03131" }}
              onClick={() => {
                onCancel?.();
                setItems([]);
                form.resetFields();
              }}
            >
              Hủy đơn
            </Button>
            <Button
              type="primary"
              style={{ background: "#e7991bff" }}
              onClick={handleSaveDraft}
              loading={isPending}
            >
              Lưu tạm
            </Button>
            <Button
              type="primary"
              style={{ background: "#2f9e44", flex: 1 }}
              onClick={handleOpenCheckout}
            >
              Tính tiền
            </Button>
          </Flex>
        </Row>

        <Modal
          title="Tính tiền"
          open={checkoutVisible}
          onCancel={() => setCheckoutVisible(false)}
          footer={null}
          width={700}
        >
          <Flex gap={24}>
            <div style={{ flex: 1, background: "#f5f7fa", borderRadius: 10, padding: 20 }}>
              <Segmented
                block
                options={["Tiền mặt", "Chuyển khoản"]}
                value={paymentMethod}
                onChange={(v) => setPaymentMethod(v as "Tiền mặt" | "Chuyển khoản")}
                style={{ marginBottom: 20 }}
              />
              {paymentMethod === "Tiền mặt" ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ marginBottom: 4 }}>
                      Tiền khách trả <span style={{ color: "red" }}>*</span>
                    </div>
                    <Input
                      value={customerPaid}
                      onChange={(e) => setCustomerPaid(Number(e.target.value.replace(/[^0-9]/g, "")))}
                      suffix="VNĐ"
                      size="large"
                    />
                  </div>
                  <div style={{ marginBottom: 4 }}>Tiền thừa trả khách</div>
                  <Input
                    value={Math.max(0, customerPaid - finalMoney.totalAmountAfterFax)}
                    readOnly
                    suffix="VNĐ"
                    size="large"
                  />
                </>
              ) : (
                <Flex vertical align="center" gap={8}>
                  <img
                    src="https://1pro.vn/wp-content/uploads/2025/03/IMG_7559.jpg"
                    alt="QR chuyển khoản"
                    style={{ width: 180, height: 180, borderRadius: 8 }}
                  />
                  <span style={{ color: "#555", fontSize: 13 }}>Quét mã QR để thanh toán</span>
                </Flex>
              )}
            </div>

            <div style={{ flex: 1, background: "#f5f7fa", borderRadius: 10, padding: 20 }}>
              <Flex justify="space-between" style={{ marginBottom: 10 }}>
                <span style={{ color: "#555" }}>Ngày tạo</span>
                <span>{createdAt}</span>
              </Flex>
              <Flex justify="space-between" style={{ marginBottom: 10 }}>
                <span style={{ color: "#555" }}>Thành tiền</span>
                <span>{formatNumber(finalMoney.totalAmount)} đ</span>
              </Flex>
              <Flex justify="space-between" style={{ marginBottom: 10 }}>
                <span style={{ color: "#555" }}>Chiết khấu</span>
                <span>{formatNumber(finalMoney.discountMoney)} đ</span>
              </Flex>
              <Flex justify="space-between" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #e0e0e0" }}>
                <span style={{ color: "#555" }}>VAT</span>
                <span>{formatNumber(finalMoney.taxMoney)} đ</span>
              </Flex>
              <Flex justify="space-between" style={{ marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Tổng thanh toán</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{formatNumber(finalMoney.totalAmountAfterFax)} đ</span>
              </Flex>
              <Flex justify="center" style={{ marginBottom: 20 }}>
                <Button icon={<PrinterOutlined />} type="text" onClick={() => dispatchToast("warning", "Tính năng đang phát triển")}>
                  In hóa đơn tạm tính
                </Button>
              </Flex>
              <Flex gap={12}>
                <Button size="large" style={{ flex: 1 }} onClick={() => setCheckoutVisible(false)}>Đóng</Button>
                <Button size="large" type="primary" style={{ flex: 1 }} onClick={handleCreateInvoice} loading={isPending}>
                  Thanh toán
                </Button>
              </Flex>
            </div>
          </Flex>
        </Modal>
      </>
    );
  },
);
