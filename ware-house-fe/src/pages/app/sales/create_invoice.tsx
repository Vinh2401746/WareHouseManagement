import { memo, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants/query-keys";
import { getProductsApi } from "../../../api/products";
// import "./create_invoice.css";
import { Col, Flex, Image, Pagination, Row, Spin, Splitter, Tag } from "antd";
import { ROOT_IMAGE_IMAGE } from "../../../constants/common";
import { ProductInvoiceList } from "./product_invoice_list";

export type InvoiceItem = {
    id: string
    imageUrl : string
    name : string
};

export const CreateInvoicePage = memo(() => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const { data, refetch, isFetching, isError, error } = useQuery({
        queryKey: [QueryKeys.products.list, { page, limit }],
        queryFn: () => {
            return getProductsApi({ page, limit });
        },
    });

    const products = useMemo(() => data?.results || [], [data])

    const renderProduct = useCallback(() => {
        if (isFetching) return <Spin />
        return (
            <>{products.map((item:InvoiceItem) => {
                return <Col key={item?.id || ''} md={6} sm={12} xs={12} >
                    <Row gutter={8}>
                        <Col>
                            <Image width={50} height={50} alt=""
                                src={`${ROOT_IMAGE_IMAGE}${item?.imageUrl || ''}`} />
                        </Col>
                        <Col>
                        <Flex vertical gap={6}>
                                <span>{item?.name || ''}</span>
                                <Tag color={"green"}
                                    variant={"outlined"}
                                    style={{ width:40, justifyContent:'center', alignItems:'center', display:'flex', cursor:'pointer' }}
                                // onClick={() => onAction("update", record)}
                                >+</Tag>
                        </Flex>
                        </Col>
                    </Row>
                </Col>
            })}</>
        )
    }, [products])

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
                            style={{ marginTop: 12, textAlign: 'right' }}
                        />
                    </Flex>
                </Splitter.Panel>
                <Splitter.Panel>
                    <ProductInvoiceList />
                </Splitter.Panel>
            </Splitter>
        </div>
    );
});
