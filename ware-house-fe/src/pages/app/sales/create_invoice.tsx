import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants/query-keys";
import { getProductsApi } from "../../../api/products";
import { Col, Flex, Image, Pagination, Row, Spin, Splitter, Tag } from "antd";
import { ROOT_IMAGE_IMAGE } from "../../../constants/common";
import {
  ProductInvoiceList,
  type ProductInvoiceListRef,
  type InvoiceItem,
} from "./product_invoice_list";

export type ProductItem = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  price?: number;
};

export type CreateInvoiceRef = {
  getItems: () => InvoiceItem[];
  clearItems: () => void;
};

export const CreateInvoicePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const invoiceListRef = useRef<ProductInvoiceListRef>(null);


  const { data, isFetching } = useQuery({
    queryKey: [QueryKeys.products.list, { page, limit }],
    queryFn: () => getProductsApi({ page, limit }),
  });

  const products = useMemo(() => data?.results || [], [data]);

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
    if (isFetching) return <Spin />;
    return (
      <>
        {products.map((item: ProductItem) => (
          <Col key={item?.id || ""} xxl={6} xl={8} lg={8} md={8} sm={12} xs={12}    onClick={() => handleAddProduct(item)}>
            <Row gutter={8} style={{
              border: selectedIds.includes(item.id) ? '1.5px solid #1677ff' : '1.5px solid transparent',
              borderRadius: 8,
              padding: 6,
              transition: 'border-color 0.2s',
            }}>
              <Col>
                <Image
                  width={50}
                  height={50}
                  alt=""
                  src={`${ROOT_IMAGE_IMAGE}${item?.imageUrl || ""}`}
                />
              </Col>
              <Col>
                <Flex vertical gap={6}>
                  <span>{item?.name || ""}</span>
                  {/* <Tag
                    color="green"
                    variant="outlined"
                    style={{
                      width: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </Tag> */}
                </Flex>
              </Col>
            </Row>
          </Col>
        ))}
      </>
    );
  }, [products, isFetching, handleAddProduct, selectedIds]);


  return (
    <div className="invoice-layout">
      <Splitter style={{ minHeight: window.screen.height - 400 }}>
        <Splitter.Panel defaultSize="80%" min="50%" max="80%" style={{padding:4}}>
          <Row gutter={[12, 12]}>{renderProduct()}</Row>
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
        </Splitter.Panel>
        <Splitter.Panel>
          <ProductInvoiceList ref={invoiceListRef} removeFromList={handleRemoveFromList} />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
