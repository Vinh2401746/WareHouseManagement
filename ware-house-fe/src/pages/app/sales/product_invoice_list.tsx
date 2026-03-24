import { memo } from "react";
import { Col, Flex, Image, Row, Tag } from "antd";
import { ROOT_IMAGE_IMAGE } from "../../../constants/common";

export type InvoiceItem = {
    id: string;
    name: string;
    code: string;
    imageUrl: string;
    quantity: number;
    price: number;
};

type Props = {
    items: InvoiceItem[];
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
};

export const ProductInvoiceList = memo(({ items, onIncrease, onDecrease }: Props) => {
    return (
        <Row gutter={[24, 24]} style={{ padding: 8 }}>
            {items.length === 0 && (
                <Col span={24} style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}>
                    Chọn sản phẩm từ danh sách bên trái
                </Col>
            )}
            {items.map((item) => (
                <Col key={item.id} md={6} sm={12} xs={12}>
                    <Row gutter={8}>
                        <Col>
                            <Image
                                width={50}
                                height={50}
                                alt=""
                                src={`${ROOT_IMAGE_IMAGE}${item.imageUrl}`}
                            />
                        </Col>
                        <Col>
                            <Flex vertical gap={6}>
                                <span>{item.name}</span>
                                <Flex gap={4} align="center">
                                    <Tag
                                        color="red"
                                        variant="outlined"
                                        style={{ width: 28, justifyContent: "center", display: "flex", cursor: "pointer" }}
                                        onClick={() => onDecrease(item.id)}
                                    >
                                        −
                                    </Tag>
                                    <span style={{ minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                                    <Tag
                                        color="green"
                                        variant="outlined"
                                        style={{ width: 28, justifyContent: "center", display: "flex", cursor: "pointer" }}
                                        onClick={() => onIncrease(item.id)}
                                    >
                                        +
                                    </Tag>
                                </Flex>
                            </Flex>
                        </Col>
                    </Row>
                </Col>
            ))}
        </Row>
    );
});
