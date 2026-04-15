import type { CSSProperties } from "react";
import { forwardRef, memo, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { formatDate, formatNumber } from "../../../../utils/helper";
import { formatNumberToWords } from "../../../../utils/numberToWords";
import logoUrl from "../../../../assets/svg/logo.svg";
import { Images } from "../../../../assets/images";
import "./inventory_a4.css";

export type InventoryA4Props = {
  transactionDetail: any;
  qrText: string;
  showWatermark?: boolean;
};

export const InventoryA4 = memo(
  forwardRef<HTMLDivElement, InventoryA4Props>(
    ({ transactionDetail, qrText, showWatermark }, ref) => {
      const items = useMemo(() => transactionDetail?.items ?? [], [transactionDetail?.items]);
      const backgroundStyle = useMemo(
        () => ({ "--inventory-bg": `url(${Images.invoice_bg})` }) as CSSProperties,
        [],
      );
      const companyInfo = useMemo(
        () => [
          "Phần mềm quản lý kho bán hàng",
          "Công ty cổ phần Thiên Triều",
          "Số điện thoại: 0988666789",
          "Email: group7@gmail.com",
          "Website: quanlykho.sanghh.space",
          "Ngân hàng: Vietcombank - CN TP. Hồ Chí Minh",
          "STK: 0123456789",
          "Mã số thuế: 0312345678",
        ],
        [],
      );

      const issuedByText = useMemo(() => {
        const softwareName = "Phần mềm quản lý kho bán hàng";
        const companyName = "CÔNG TY CỔ PHẦN THIÊN TRIỀU";
        const website = "quanlykho.sanghh.space";
        const taxCode = "0312345678";
        return `Phát hành bởi ${softwareName} - ${companyName} (${website}) - MST ${taxCode}`;
      }, []);

      const isImport = transactionDetail?.type === "IMPORT";
      const titleText = isImport ? "PHIẾU NHẬP KHO" : "PHIẾU XUẤT KHO";
      const dateText = transactionDetail?.transactionDate
        ? formatDate(transactionDetail.transactionDate)
        : "";
      const codeText = transactionDetail?.code || transactionDetail?.id || "";
      const totalAmount = transactionDetail?.totalAmount ?? 0;
      const taxMoney = transactionDetail?.taxMoney ?? 0;
      const totalAmountAfterFax = transactionDetail?.totalAmountAfterFax ?? 0;
      const taxRatePercent = totalAmount > 0 ? Math.round((taxMoney / totalAmount) * 100) : 0;
      const taxRateLabel = taxRatePercent > 0 ? `${taxRatePercent}%` : "-";
      const amountInWords = totalAmountAfterFax
        ? formatNumberToWords(totalAmountAfterFax)
        : "";

      const supplierName = transactionDetail?.supplier?.name || "-";
      const supplierPhone = transactionDetail?.supplier?.phone || "-";
      const saleCode = transactionDetail?.sale?.code || "-";
      const createdBy =
        transactionDetail?.createdBy?.name || transactionDetail?.createdBy?.email || "-";

      const leftSignTitle = isImport ? "Người giao hàng" : "Người xuất kho";
      const rightSignTitle = "Người nhận hàng";

      return (
        <div className="inventory-a4" ref={ref} style={backgroundStyle}>
          {showWatermark ? <div className="inventory-a4__watermark">ĐÃ HỦY</div> : null}

          <div className="inventory-a4__content">
            <div className="inventory-a4__header inventory-a4__header--company">
              <img className="inventory-a4__logo" src={logoUrl} alt="Logo" />
              <div className="inventory-a4__supplier">
                <div className="inventory-a4__company">
                  {companyInfo.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
                <div className="inventory-a4__branch">
                  <div>Kho: {transactionDetail?.warehouse?.name || "-"}</div>
                  <div>Địa chỉ: {transactionDetail?.warehouse?.address || "-"}</div>
                  <div>Mã kho: {transactionDetail?.warehouse?.code || "-"}</div>
                </div>
              </div>
            </div>
            <br />
            <div className="inventory-a4__header inventory-a4__header--title">
              <div style={{ width: "16%" }}></div>
              <div className="inventory-a4__title">
                <h1>{titleText}</h1>
                <div className="inventory-a4__meta">
                  <div>Ký hiệu phiếu: {codeText || "-"}</div>
                  <div>Ngày lập: {dateText || "-"}</div>
                </div>
              </div>
              <QRCodeCanvas value={qrText || ""} size={96} includeMargin />
            </div>
            <br />

            <div className="inventory-a4__sections">
              <div className="inventory-a4__box">
                <h3>Thông tin phiếu</h3>
                <div className="inventory-a4__row">
                  <div className="inventory-a4__row-label">Người tạo:</div>
                  <div className="inventory-a4__cell-wrap">{createdBy}</div>
                </div>
                <div className="inventory-a4__row">
                  <div className="inventory-a4__row-label">Lý do:</div>
                  <div className="inventory-a4__cell-wrap">{transactionDetail?.reason || "-"}</div>
                </div>
                {isImport ? (
                  <div className="inventory-a4__row">
                    <div className="inventory-a4__row-label">Người giao:</div>
                    <div className="inventory-a4__cell-wrap">{transactionDetail?.deliveryPerson || "-"}</div>
                  </div>
                ) : null}
              </div>

              <div className="inventory-a4__box">
                <h3>{isImport ? "Nhà cung cấp" : "Thông tin bán hàng"}</h3>
                {isImport ? (
                  <>
                    <div className="inventory-a4__row">
                      <div className="inventory-a4__row-label">Tên:</div>
                      <div className="inventory-a4__cell-wrap">{supplierName}</div>
                    </div>
                    <div className="inventory-a4__row">
                      <div className="inventory-a4__row-label">SĐT:</div>
                      <div className="inventory-a4__cell-wrap">{supplierPhone}</div>
                    </div>
                  </>
                ) : (
                  <div className="inventory-a4__row">
                    <div className="inventory-a4__row-label">Đơn bán:</div>
                    <div className="inventory-a4__cell-wrap">{saleCode}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="inventory-a4__table-wrap">
              <table className="inventory-a4__table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: "center" }}>STT</th>
                    <th style={{ width: 80 }}>Mã hàng</th>
                    <th style={{ width: 100 }}>Tên hàng hóa, dịch vụ</th>
                    <th style={{ width: 80 }}>ĐVT</th>
                    <th style={{ width: 70, textAlign: "right" }}>Số lượng</th>
                    <th style={{ width: 110, textAlign: "right" }}>Đơn giá</th>
                    <th style={{ width: 120, textAlign: "right" }}>Thành tiền</th>
                    <th style={{ width: 90, textAlign: "center" }}>Thuế suất</th>
                    <th style={{ width: 120, textAlign: "right" }}>Tiền thuế</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => {
                    const productName = item?.productName || item?.product?.name || "";
                    const productCode = item?.productCode || item?.product?.code || "";
                    const unitName = item?.unit?.name || item?.product?.unit?.name || "";
                    const quantity = item?.quantity ?? 0;
                    const price = item?.price ?? 0;
                    const lineTotal = typeof item?.totalAmount === "number" ? item.totalAmount : quantity * price;
                    const lineTax = taxRatePercent
                      ? Math.round((lineTotal * taxRatePercent) / 100)
                      : 0;

                    return (
                      <tr key={item?.id || item?._id || `${index}`}>
                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                        <td>{productCode || "-"}</td>
                        <td>
                          <div className="inventory-a4__cell-wrap">{productName}</div>
                        </td>
                        <td>{unitName || "-"}</td>
                        <td style={{ textAlign: "right" }}>{formatNumber(quantity)}</td>
                        <td style={{ textAlign: "right" }}>{formatNumber(price)} đ</td>
                        <td style={{ textAlign: "right" }}>{formatNumber(lineTotal)} đ</td>
                        <td style={{ textAlign: "center" }}>{taxRateLabel}</td>
                        <td style={{ textAlign: "right" }}>
                          {lineTax ? `${formatNumber(lineTax)} đ` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="inventory-a4__tax-summary">
              <table className="inventory-a4__table inventory-a4__tax-table">
                <thead>
                  <tr>
                    <th />
                    <th>Thành tiền trước thuế GTGT</th>
                    <th>Tiền thuế GTGT</th>
                    <th>Cộng tiền thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Thuế suất {taxRateLabel}:</td>
                    <td>{formatNumber(totalAmount)} đ</td>
                    <td>{formatNumber(taxMoney)} đ</td>
                    <td>{formatNumber(totalAmountAfterFax)} đ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="inventory-a4__amount-in-words">
              Số tiền viết bằng chữ: {amountInWords || "-"}
            </div>

            <div className="inventory-a4__signatures">
              <div className="inventory-a4__signature-col">
                <div className="inventory-a4__signature-title">{leftSignTitle}</div>
                <div className="inventory-a4__signature-note">(Ký, ghi rõ họ tên)</div>
              </div>
              <div className="inventory-a4__signature-col">
                <div className="inventory-a4__signature-title">{rightSignTitle}</div>
                <div className="inventory-a4__signature-note">(Ký, ghi rõ họ tên)</div>
              </div>
            </div>

            <div className="inventory-a4__bottom">
              <div className="inventory-a4__issued-by">{issuedByText}</div>
              <div className="inventory-a4__lookup">
                Tra cứu tại Website: quanlykho.sanghh.space - Mã tra cứu: {codeText || "-"}
              </div>
              {showWatermark ? <div className="inventory-a4__cancelled">Phiếu đã bị hủy</div> : null}
            </div>
          </div>
        </div>
      );
    },
  ),
);

InventoryA4.displayName = "InventoryA4";
