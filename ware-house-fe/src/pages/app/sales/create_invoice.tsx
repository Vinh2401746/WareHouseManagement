import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants/query-keys";
import { getProductsForPOS } from "../../../api/products";
import { getWarehousesApi } from "../../../api/warehouse";
import { Breadcrumb, Col, Flex, Image, Pagination, Row, Spin, Splitter, Select, Input } from "antd";
import { ROOT_IMAGE_IMAGE } from "../../../constants/common";
import {
  ProductInvoiceList,
  type ProductInvoiceListRef,
  type InvoiceItem,
} from "./product_invoice_list";
import { UserOutlined } from "@ant-design/icons";
import { AppRoutes } from "../../../router/routes";
import dispatchToast from "../../../constants/toast";

export type ProductItem = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  price?: number;
  // mapped from API
  sellingPrice?: number;
  totalStock?: number
};

export type CreateInvoiceRef = {
  getItems: () => InvoiceItem[];
  clearItems: () => void;
};

export const CreateInvoicePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const invoiceListRef = useRef<ProductInvoiceListRef>(null);

  // Fetch warehouses
  const { data: warehouseData } = useQuery({
    queryKey: [QueryKeys.warehouse.list, { limit: 100 }],
    queryFn: () => getWarehousesApi({ page: 1, limit: 100 }),
  });
  const warehouses = warehouseData?.results || [];

  const { data, isFetching } = useQuery({
    queryKey: [QueryKeys.products.list_invent, { page, limit, warehouseId, keyword }],
    queryFn: () => getProductsForPOS({ page, limit, warehouseId, keyword }),
    enabled: !!warehouseId, // Only fetch if a warehouse is selected
  });

  const products = useMemo(() => data?.results?.map((item: any) => ({
    ...item,
    price: item.sellingPrice || 0, // Auto price
  })) || [], [data]);


  const handleAddProduct = useCallback((product: ProductItem) => {
    invoiceListRef.current?.addProduct(product);
    setSelectedIds((prev) =>
      prev.includes(product.id) ? prev : [...prev, product.id]
    );
  }, []);

  const handleRemoveFromList = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const renderProduct = useCallback(() => {
    if (!warehouseId) {
      return (
        <Col span={24}>
          <Flex justify="center" align="center" style={{ height: 200, color: '#888' }}>
            Vui lòng chọn Kho để xem sản phẩm
          </Flex>
        </Col>
      );
    }
    if (isFetching) return <Spin />;
    return (
      <>
        {products.map((item: ProductItem) => (
          <Col key={item?.id || ""} xxl={6} xl={8} lg={8} md={8} sm={12} xs={12} onClick={() => {
            if (Number(item?.totalStock || 0) <= 0) return dispatchToast("warning", "Sản phẩm đã hết trong kho hiện tại!")
            handleAddProduct(item)
          }}>
            <Row gutter={8} style={{
              border: selectedIds.includes(item.id) ? '1.5px solid #1677ff' : '1.5px solid transparent',
              borderRadius: 8,
              padding: 6,
              transition: 'border-color 0.2s',
              backgroundColor: Number(item?.totalStock || 0) <= 0 ? "#e3e4e6ff" : "transparent",
              cursor: 'pointer'
            }}>
              <Col>
                <Image
                  preview={false}
                  width={50}
                  height={50}
                  style={{ borderRadius: 8 }}
                  alt=""
                  src={item?.imageUrl ? `${ROOT_IMAGE_IMAGE}${item?.imageUrl}` : 'https://images.pexels.com/photos/16211537/pexels-photo-16211537.jpeg'}
                />
              </Col>
              <Col>
                <Flex vertical gap={6}>
                  <span style={{ fontWeight: 500, lineHeight: 1.2 }}>{item?.name || ""}</span>
                  <span style={{ color: '#00a63e', fontWeight: 600 }}>{item.price?.toLocaleString()}đ</span>
                  <span style={{
                    fontSize: 12,
                    color: Number(item?.totalStock) < 10 ? "red" : '#666'
                  }}>Tồn kho: {item?.totalStock || "0"}</span>
                </Flex>
              </Col>
            </Row>
          </Col>
        ))}
      </>
    );
  }, [products, isFetching, handleAddProduct, selectedIds, warehouseId]);

  return (
    <div className="invoice-layout">
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Breadcrumb
          items={[
            {
              href: AppRoutes.sales_invoice,
              title: (
                <>
                  <UserOutlined />
                  <span>Quay lại</span>
                </>
              ),
            },
          ]}
        />
      </Flex>
      <Splitter style={{ minHeight: window.screen.height - 400 }}>
        <Splitter.Panel defaultSize="70%" min="50%" max="70%" style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
          
          <Flex gap={12} style={{ marginBottom: 16 }}>
            <Select 
              placeholder="Chọn kho bán hàng"
              style={{ width: 250 }}
              value={warehouseId || undefined}
              onChange={(val) => {
                setWarehouseId(val);
                setPage(1);
                if (selectedIds.length > 0) {
                  invoiceListRef.current?.clearItems();
                  setSelectedIds([]);
                  dispatchToast('info', 'Giỏ hàng đã được làm mới do đổi kho');
                }
              }}
              options={warehouses.map((w: any) => ({ label: w.name, value: w.id }))}
            />
            <Input.Search 
              placeholder="Tìm kiếm sản phẩm..." 
              style={{ maxWidth: 300 }} 
              allowClear
              onSearch={(val) => {
                setKeyword(val);
                setPage(1);
              }}
            />
          </Flex>

          <Row gutter={[12, 12]} style={{ flex: 1, alignContent: 'flex-start' }}>{renderProduct()}</Row>
          
          {warehouseId && (
            <Flex justify="end">
              <Pagination
                current={page}
                pageSize={limit}
                total={data?.totalResults || 0}
                onChange={(p) => setPage(p)}
                onShowSizeChange={(_, size) => {
                  setLimit(size);
                  setPage(1);
                }}
                showSizeChanger
                style={{ marginTop: 12, textAlign: "right" }}
              />
            </Flex>
          )}

        </Splitter.Panel>
        <Splitter.Panel style={{ padding: 25 }}>
          <ProductInvoiceList 
            ref={invoiceListRef} 
            removeFromList={handleRemoveFromList} 
            warehouseId={warehouseId}
            onCancel={() => {
              if (selectedIds.length == 0) { return dispatchToast('warning', "Không có sản phẩm trong đơn để huỷ."); }
              setSelectedIds([]); 
              invoiceListRef.current?.clearItems();
              dispatchToast('success', "Đã xoá tất cả sản phẩm khỏi giỏ");
            }} 
          />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
