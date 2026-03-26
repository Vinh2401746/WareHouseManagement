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
  const invoiceListRef = useRef<ProductInvoiceListRef>(null);


  const { data, isFetching } = useQuery({
    queryKey: [QueryKeys.products.list, { page, limit }],
    queryFn: () => getProductsApi({ page, limit }),
  });

  const products = useMemo(() => data?.results || [], [data]);

  const handleAddProduct = useCallback((product: ProductItem) => {
    invoiceListRef.current?.addProduct(product);
  }, []);

  const renderProduct = useCallback(() => {
    if (isFetching) return <Spin />;
    return (
      <>
        {products.map((item: ProductItem) => (
          <Col key={item?._id || ""} md={6} sm={12} xs={12}>
            <Row gutter={8}>
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
                  <Tag
                    color="green"
                    variant="outlined"
                    style={{
                      width: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      cursor: "pointer",
                    }}
                    onClick={() => handleAddProduct(item)}
                  >
                    +
                  </Tag>
                </Flex>
              </Col>
            </Row>
          </Col>
        ))}
      </>
    );
  }, [products, isFetching, handleAddProduct]);


  return (
    <div className="invoice-layout">
      <Splitter style={{ minHeight: window.screen.height - 300 }}>
        <Splitter.Panel defaultSize="80%" min="50%" max="80%">
          <Row gutter={[24, 24]}>{renderProduct()}</Row>
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
          <ProductInvoiceList ref={invoiceListRef} />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
