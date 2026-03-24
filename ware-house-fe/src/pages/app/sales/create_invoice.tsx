import { memo, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants/query-keys";
import { getProductsApi } from "../../../api/products";
// import "./create_invoice.css";
import { Col, Flex, Image, Pagination, Row, Spin, Splitter, Tag } from "antd";
import { ROOT_IMAGE_IMAGE } from "../../../constants/common";
import { ProductInvoiceList, type InvoiceItem } from "./product_invoice_list";

export type ProductItem = {
    _id: string
    imageUrl: string
    name: string
    code: string
    price?: number
};

export const CreateInvoicePage = memo(() => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

    const { data, isFetching } = useQuery({
        queryKey: [QueryKeys.products.list, { page, limit }],
        queryFn: () => getProductsApi({ page, limit }),
    });

    const products = useMemo(() => data?.results || [], [data]);

    const handleAddProduct = useCallback((product: ProductItem) => {
        setInvoiceItems((prev) => {
            const exists = prev.find((i) => i.id === product._id);
            console.log("exists",{exists, product})
            if (exists) {
                return prev.map((i) =>
                    i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...prev,
                {
                    id: product._id,
                    name: product.name,
                    code: product.code,
                    imageUrl: product.imageUrl ?? "",
                    quantity: 1,
                    price: product.price ?? 0,
                },
            ];
        });
    }, []);

    const handleIncrease = useCallback((id: string) => {
        setInvoiceItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
        );
    }, []);

    const handleDecrease = useCallback((id: string) => {
        setInvoiceItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (!item) return prev;
            if (item.quantity <= 1) return prev.filter((i) => i.id !== id);
            return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
        });
    }, []);

    const renderProduct = useCallback(() => {
        if (isFetching) return <Spin />;
        return (
            <>
                {products.map((item: ProductItem) => (
                    <Col key={item?._id || ""} md={6} sm={12} xs={12}>
                        <Row gutter={8}>
                            <Col>
                                <Image width={50} height={50} alt=""
                                    src={`${ROOT_IMAGE_IMAGE}${item?.imageUrl || ""}`} />
                            </Col>
                            <Col>
                                <Flex vertical gap={6}>
                                    <span>{item?.name || ""}</span>
                                    <Tag
                                        color="green"
                                        variant="outlined"
                                        style={{ width: 40, justifyContent: "center", alignItems: "center", display: "flex", cursor: "pointer" }}
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
                <Splitter.Panel defaultSize="80%" min="20%" max="80%">
                    <Row gutter={[24, 24]}>
                        {renderProduct()}
                    </Row>
                    <Flex justify="end">
                        <Pagination
                            current={page}
                            pageSize={limit}
                            total={data?.totalResults || 0}
                            onChange={(p) => setPage(p)}
                            onShowSizeChange={(_, size) => { setLimit(size); setPage(1); }}
                            showSizeChanger
                            style={{ marginTop: 12, textAlign: "right" }}
                        />
                    </Flex>
                </Splitter.Panel>
                <Splitter.Panel>
                    <ProductInvoiceList
                        items={invoiceItems}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                    />
                </Splitter.Panel>
            </Splitter>
        </div>
    );
});
