import { forwardRef, memo, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { formatDate, formatNumber } from "../../../../utils/helper";
import logoUrl from "../../../../assets/svg/logo.svg";
import "./invoice_a4.css";

export type InvoiceA4Props = {
  saleDetail: any;
  qrText: string;
  showWatermark?: boolean;
};

export const InvoiceA4 = memo(
  forwardRef<HTMLDivElement, InvoiceA4Props>(
    ({ saleDetail, qrText, showWatermark }, ref) => {
      const items = useMemo(() => saleDetail?.items ?? [], [saleDetail?.items]);

      const customerDisplayName =
        saleDetail?.customer?.name || saleDetail?.customerName || "Khách vãng lai";

      const saleDateText = saleDetail?.saleDate
        ? formatDate(saleDetail.saleDate)
        : "";

      return (
        <div className="invoice-a4" ref={ref}>
          {showWatermark ? (
            <div className="invoice-a4__watermark">ĐÃ HỦY - CANCELLED</div>
          ) : null}

          <div className="invoice-a4__header">
            <div>
              <img className="invoice-a4__logo" src={logoUrl} alt="Logo" />
              <div className="invoice-a4__meta">
                <div>{saleDetail?.branch?.name || ""}</div>
                <div>{saleDetail?.branch?.address || ""}</div>
                <div>{saleDetail?.branch?.phone || ""}</div>
              </div>
            </div>

            <div className="invoice-a4__title">
              <h1>HÓA ĐƠN BÁN HÀNG</h1>
              <div className="invoice-a4__meta">
                <div>Mã HĐ: {saleDetail?.code || saleDetail?.id || ""}</div>
                <div>Ngày bán: {saleDateText}</div>
              </div>
            </div>
          </div>

          <div className="invoice-a4__sections">
            <div className="invoice-a4__box">
              <h3>Thông tin khách hàng</h3>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">Khách:</div>
                <div className="invoice-a4__cell-wrap">{customerDisplayName}</div>
              </div>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">SĐT:</div>
                <div className="invoice-a4__cell-wrap">
                  {saleDetail?.customer?.phone || ""}
                </div>
              </div>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">Địa chỉ:</div>
                <div className="invoice-a4__cell-wrap">
                  {saleDetail?.customer?.address || ""}
                </div>
              </div>
            </div>

            <div className="invoice-a4__box">
              <h3>Thông tin bán hàng</h3>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">Kho:</div>
                <div className="invoice-a4__cell-wrap">
                  {saleDetail?.warehouse?.name || ""}
                </div>
              </div>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">Nhân viên:</div>
                <div className="invoice-a4__cell-wrap">
                  {saleDetail?.soldBy?.name || saleDetail?.soldBy?.email || ""}
                </div>
              </div>
              <div className="invoice-a4__row">
                <div className="invoice-a4__row-label">Ghi chú:</div>
                <div className="invoice-a4__cell-wrap">{saleDetail?.note || ""}</div>
              </div>
            </div>
          </div>

          <div className="invoice-a4__table-wrap">
            <table className="invoice-a4__table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>#</th>
                  <th>Sản phẩm</th>
                  <th style={{ width: 90 }}>ĐVT</th>
                  <th style={{ width: 70, textAlign: "right" }}>SL</th>
                  <th style={{ width: 110, textAlign: "right" }}>Đơn giá</th>
                  <th style={{ width: 120, textAlign: "right" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => {
                  const productName = item?.product?.name || "";
                  const unitName = item?.product?.unit?.name || "";
                  const quantity = item?.quantity ?? 0;
                  const price = item?.price ?? item?.product?.sellingPrice ?? 0;
                  const lineTotal = item?.lineTotal ?? quantity * price;

                  return (
                    <tr key={item?.id || item?._id || `${index}`}
                    >
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>
                        <div className="invoice-a4__cell-wrap">{productName}</div>
                        {item?.product?.code ? (
                          <div style={{ color: "#666", marginTop: 2 }}>
                            {item.product.code}
                          </div>
                        ) : null}
                      </td>
                      <td>{unitName}</td>
                      <td style={{ textAlign: "right" }}>{formatNumber(quantity)}</td>
                      <td style={{ textAlign: "right" }}>{formatNumber(price)} đ</td>
                      <td style={{ textAlign: "right" }}>{formatNumber(lineTotal)} đ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="invoice-a4__totals">
            <table>
              <tbody>
                <tr>
                  <td>Tổng tiền</td>
                  <td>{formatNumber(saleDetail?.totalAmount ?? 0)} đ</td>
                </tr>
                <tr>
                  <td>Chiết khấu</td>
                  <td>{formatNumber(saleDetail?.discountMoney ?? 0)} đ</td>
                </tr>
                <tr>
                  <td>Thuế</td>
                  <td>{formatNumber(saleDetail?.taxMoney ?? 0)} đ</td>
                </tr>
                <tr>
                  <td>
                    <b>Tổng phải thu</b>
                  </td>
                  <td>
                    <b>{formatNumber(saleDetail?.totalAmountAfterFax ?? 0)} đ</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="invoice-a4__footer">
            <div style={{ color: "#666" }}>
              {showWatermark ? "Hóa đơn đã bị hủy" : ""}
            </div>
            <QRCodeCanvas value={qrText || ""} size={96} includeMargin />
          </div>
        </div>
      );
    },
  ),
);

InvoiceA4.displayName = "InvoiceA4";
