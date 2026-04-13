export type ExportInventoryPdfArgs = {
  element: HTMLElement;
  filename: string;
};

export const exportInventoryPdf = async ({ element, filename }: ExportInventoryPdfArgs) => {
  if (!element) return;

  const html2pdf = (await import("html2pdf.js")).default as any;

  const options = {
    filename,
    margin: 0,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  await html2pdf().set(options).from(element).save();
};
