import type { CSSProperties } from "react";
import { forwardRef, memo, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { formatDate, formatNumber } from "../../../../utils/helper";
import { formatNumberToWords } from "../../../../utils/numberToWords";
import logoUrl from "../../../../assets/svg/logo.svg";
import { Images } from "../../../../assets/images";
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
      const backgroundStyle = useMemo(
        () =>
          ({ "--invoice-bg": `url(${Images.invoice_bg})` }) as CSSProperties,
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

      const customerDisplayName =
        saleDetail?.customer?.name ||
        saleDetail?.customerName ||
        "Khách vãng lai";

      const saleCode = saleDetail?.code || saleDetail?.id || "";
      const saleDateText = saleDetail?.saleDate
        ? formatDate(saleDetail.saleDate)
        : "";
      const totalAmount = saleDetail?.totalAmount ?? 0;
      const taxMoney = saleDetail?.taxMoney ?? 0;
      const totalAmountAfterFax = saleDetail?.totalAmountAfterFax ?? 0;
      const taxRatePercent =
        totalAmount > 0 ? Math.round((taxMoney / totalAmount) * 100) : 0;
      const taxRateLabel = taxRatePercent > 0 ? `${taxRatePercent}%` : "-";
      const amountInWords = totalAmountAfterFax
        ? formatNumberToWords(totalAmountAfterFax)
        : "";

      const exportTransaction = saleDetail?.exportTransaction;
      const exportCode = exportTransaction?.code || "-";
      const exportDateText = exportTransaction?.transactionDate
        ? formatDate(exportTransaction.transactionDate)
        : "-";
      const exportWarehouseName =
        exportTransaction?.warehouse?.name ||
        saleDetail?.warehouse?.name ||
        "-";
      const soldBy =
        saleDetail?.soldBy?.name || saleDetail?.soldBy?.email || "-";

      return (
        <div className="invoice-a4" ref={ref} style={backgroundStyle}>
          {showWatermark ? (
            <div className="invoice-a4__watermark">ĐÃ HỦY</div>
          ) : null}

          <div className="invoice-a4__content">
            <div className="invoice-a4__header header-flex-center">
              <img className="invoice-a4__logo" src={logoUrl} alt="Logo" />
              <div className="invoice-a4__supplier">
                <div className="invoice-a4__company">
                  {companyInfo.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
                <div className="invoice-a4__branch">
                  <div>Cửa hàng: {saleDetail?.branch?.name || "-"}</div>
                  <div>Địa chỉ: {saleDetail?.branch?.address || "-"}</div>
                  <div>Số điện thoại: {saleDetail?.branch?.phone || "-"}</div>
                </div>
              </div>
            </div>
            <br />
            <div className="invoice-a4__header">
              <div style={{ width: "16%" }}></div>
              <div className="invoice-a4__title">
                <h1>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h1>
                <div className="invoice-a4__meta">
                  <div>Ngày lập: {saleDateText || "-"}</div>
                  <div>Mã CQT: -</div>
                  <div>Ký hiệu: {saleCode || "-"}</div>
                  <div>Số: -</div>
                </div>
              </div>
              <QRCodeCanvas value={qrText || ""} size={96} includeMargin />
            </div>
            <br />

            <div className="invoice-a4__sections">
              <div className="invoice-a4__box">
                <h3>Thông tin hóa đơn</h3>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">
                    Họ tên người mua hàng:
                  </div>
                  <div className="invoice-a4__cell-wrap">
                    {customerDisplayName}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Tên đơn vị:</div>
                  <div className="invoice-a4__cell-wrap">
                    {customerDisplayName}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Mã số thuế:</div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.customer?.taxCode || "-"}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Địa chỉ:</div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.customer?.address || "-"}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Điện thoại:</div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.customer?.phone || "-"}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">
                    Căn cước công dân:
                  </div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.customer?.idNumber || "-"}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Số tài khoản:</div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.customer?.bankAccount || "-"}
                  </div>
                </div>
              </div>

              <div className="invoice-a4__box">
                <h3>Thông tin phiếu xuất kho</h3>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Ký hiệu phiếu:</div>
                  <div className="invoice-a4__cell-wrap">{exportCode}</div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Ngày xuất:</div>
                  <div className="invoice-a4__cell-wrap">{exportDateText}</div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Kho xuất:</div>
                  <div className="invoice-a4__cell-wrap">
                    {exportWarehouseName}
                  </div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Nhân viên:</div>
                  <div className="invoice-a4__cell-wrap">{soldBy}</div>
                </div>
                <div className="invoice-a4__row">
                  <div className="invoice-a4__row-label">Ghi chú:</div>
                  <div className="invoice-a4__cell-wrap">
                    {saleDetail?.note || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-a4__table-wrap">
              <table className="invoice-a4__table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: "center" }}>STT</th>
                    <th style={{ width: 80 }}>Mã hàng</th>
                    <th style={{ width: 100 }}>Tên hàng hóa, dịch vụ</th>
                    <th style={{ width: 80 }}>ĐVT</th>
                    <th style={{ width: 70, textAlign: "right" }}>Số lượng</th>
                    <th style={{ width: 110, textAlign: "right" }}>Đơn giá</th>
                    <th style={{ width: 120, textAlign: "right" }}>
                      Thành tiền
                    </th>
                    <th style={{ width: 90, textAlign: "center" }}>
                      Thuế suất
                    </th>
                    <th style={{ width: 120, textAlign: "right" }}>
                      Tiền thuế
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => {
                    const productName = item?.product?.name || "";
                    const productCode = item?.product?.code || "";
                    const unitName = item?.product?.unit?.name || "";
                    const quantity = item?.quantity ?? 0;
                    const price =
                      item?.price ?? item?.product?.sellingPrice ?? 0;
                    const lineTotal = item?.lineTotal ?? quantity * price;
                    const lineTax = taxRatePercent
                      ? Math.round((lineTotal * taxRatePercent) / 100)
                      : 0;

                    return (
                      <tr key={item?.id || item?._id || `${index}`}>
                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                        <td>{productCode || "-"}</td>
                        <td>
                          <div className="invoice-a4__cell-wrap">
                            {productName}
                          </div>
                        </td>
                        <td>{unitName || "-"}</td>
                        <td style={{ textAlign: "right" }}>
                          {formatNumber(quantity)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatNumber(price)} đ
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatNumber(lineTotal)} đ
                        </td>
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

            <div className="invoice-a4__tax-summary">
              <table className="invoice-a4__table invoice-a4__tax-table">
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

            <div className="invoice-a4__amount-in-words">
              Số tiền viết bằng chữ: {amountInWords || "-"}
            </div>

            <div className="invoice-a4__signatures">
              <div className="invoice-a4__signature-col">
                <div className="invoice-a4__signature-title">
                  Người mua hàng
                </div>
                <div className="invoice-a4__signature-note">
                  (Chữ ký số nếu có)
                </div>
              </div>
              <div className="invoice-a4__signature-col">
                <div className="invoice-a4__signature-title">
                  Người bán hàng
                </div>
                <div className="invoice-a4__signature-note">
                  (Chữ ký điện tử, chữ ký số)
                </div>
              </div>
            </div>

            <div className="invoice-a4__bottom">
              <div className="invoice-a4__issued-by">{issuedByText}</div>
              <div className="invoice-a4__lookup">
                Tra cứu tại Website: quanlykho.sanghh.space - Mã tra cứu:{" "}
                {saleCode || "-"}
              </div>
            </div>
          </div>
        </div>
      );
    },
  ),
);

InvoiceA4.displayName = "InvoiceA4";
