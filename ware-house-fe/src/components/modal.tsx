import {
  forwardRef,
  useImperativeHandle,
  useState,
  type PropsWithChildren,
} from "react";
import { Modal, type ModalProps } from "antd";

export type ModalCommonRef = {
  show: (data?: any) => void;
  hide: () => void;
};
export type ModalCommonProps = PropsWithChildren & ModalProps;

const ModalCommon = forwardRef<ModalCommonRef, ModalCommonProps>(
  (props, ref) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      show: () => {
        setOpen(true);

        // if (data) {
        //   form.setFieldsValue({
        //     ...data,
        //   });
        //   setDataUser(data as UserFormData)
        // } else {
        //   form.resetFields();
        // }
      },
      hide: () => {
        setOpen(false);
      },
    }));

    return (
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        //   onOk={() => form.submit()}
        // destroyOnHidden
        //   okText={`${!isUpdate ? "Tạo" : "Cập nhật"}`}
        cancelText="Đóng"
        {...props}
      >
        {props.children}
      </Modal>
    );
  },
);

export default ModalCommon;
