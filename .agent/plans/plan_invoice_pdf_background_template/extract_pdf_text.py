from pathlib import Path
import PyPDF2

pdf_path = Path(r"e:\Work\WareHouseManagement\ware-house-fe\src\assets\images\invoice_0312303803-999_ymof0q.pdf")
output_path = Path(
    r"e:\Work\WareHouseManagement\.agent\plans\plan_invoice_pdf_background_template\invoice_0312303803-999_ymof0q.md"
)

reader = PyPDF2.PdfReader(str(pdf_path))
lines = []
lines.append("# PDF Extract: invoice_0312303803-999_ymof0q.pdf")
lines.append("")
lines.append(f"Pages: {len(reader.pages)}")

for index, page in enumerate(reader.pages, start=1):
    box = page.mediabox
    lines.append("")
    lines.append(f"## Page {index}")
    lines.append(f"- MediaBox: {box}")
    text = page.extract_text() or ""
    lines.append("")
    lines.append("### Extracted Text")
    lines.append("")
    lines.append(text.strip() if text.strip() else "(No text extracted)")

output_path.write_text("\n".join(lines), encoding="utf-8")
print(output_path)
