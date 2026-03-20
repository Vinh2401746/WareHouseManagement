import {
    forwardRef,
    useImperativeHandle,
    useState,
} from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Row,
    Col,
    Flex,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import dispatchToast from "../../../../constants/toast";
import { cancelAnInventoryApi } from "../../../../api/inventory/inventory";
import "./style.css";


export type CancelFormRef = {
    show: (data: Partial<any>) => void;
    hide: () => void;
    onSuccessUnit?: () => void;
};


type CancelImportProps = {
    onSuccessModal: () => void;
};

type FormType = {
    cancelReason: string
}


const CancelImport = forwardRef<CancelFormRef, CancelImportProps>(
    ({ onSuccessModal }, ref) => {
        const [id, setId] = useState('')
        const [open, setOpen] = useState(false);

        const [form] = Form.useForm<FormType>();
        useImperativeHandle(ref, () => ({
            show: (data: any) => {
                console.log("data", data)
                setOpen(true);
                setId(data)
            },
            hide: () => {
                setOpen(false);
                form.resetFields();
            },
        }));

        const { mutate } = useMutation({
            mutationFn: (payload: { id: string, cancelReason: string }) => {
                console.log("iddd", payload)
                return cancelAnInventoryApi(payload)
            },
            onSuccess: () => {
                dispatchToast(
                    "success",
                    `Huỷ đơn nhập kho thành công`,
                );
                setOpen(false);
                form.resetFields()
                setId('')
                onSuccessModal();
            },
            onError: (error: any) => {
                dispatchToast(
                    "warning",
                    error?.response?.data?.message ||
                    `Huỷ đơn nhập kho thất bại`,
                );
            },
        });





        const onFinish = (values: FormType) => {
            if (!id) return dispatchToast(
                "warning",
                `Huỷ đơn nhập kho thất bại`,
            );
            mutate({
                cancelReason: values.cancelReason,
                id: id
            });
        };
        const onCancel = () => {
            form.resetFields()
            setOpen(false)
            setId('')
        }

        return (
            <Modal
                open={open}
                // title="Nhập kho"
                onCancel={onCancel}
                // onOk={() => form.submit()}
                // onOk={() => onFinish({})}
                // destroyOnHidden
                title={`Từ chối đơn nhập kho`}

                // cancelText="Đóng"

                footer={false}
                width={"50%"}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                //   initialValues={initForm}
                >


                    <Row gutter={8}>
                        <Col span={24}>
                            <Form.Item
                                label="Lý do huỷ"
                                name="cancelReason"
                                rules={[
                                    { required: true, message: "Vui lòng nhập lý do huỷ đơn nhập kho" },
                                ]}
                            >
                                <Input maxLength={100} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end" gap={12}>
                        <Button htmlType="reset" onClick={onCancel}>
                            Đóng
                        </Button>
                        <Button htmlType="submit" type="primary">
                            Xác nhận
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        );
    },
);

export default CancelImport;
