const UNITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const GROUPS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

const readTriple = (value: number, full: boolean): string => {
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  const ten = Math.floor(rest / 10);
  const unit = rest % 10;
  const parts: string[] = [];

  if (full || hundred > 0) {
    parts.push(`${UNITS[hundred]} trăm`);
  }

  if (ten > 1) {
    parts.push(`${UNITS[ten]} mươi`);
    if (unit === 1) {
      parts.push("mốt");
    } else if (unit === 5) {
      parts.push("lăm");
    } else if (unit > 0) {
      parts.push(UNITS[unit]);
    }
  } else if (ten === 1) {
    parts.push("mười");
    if (unit === 5) {
      parts.push("lăm");
    } else if (unit > 0) {
      parts.push(UNITS[unit]);
    }
  } else if (unit > 0) {
    if (full) {
      parts.push("lẻ");
    }
    parts.push(UNITS[unit]);
  }

  return parts.join(" ").trim();
};

const toVietnameseWords = (value: number): string => {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "không";

  let number = Math.floor(Math.abs(value));
  let groupIndex = 0;
  const chunks: string[] = [];

  while (number > 0 && groupIndex < GROUPS.length) {
    const chunk = number % 1000;
    if (chunk > 0) {
      const chunkText = readTriple(chunk, groupIndex > 0);
      const groupText = GROUPS[groupIndex];
      chunks.unshift(groupText ? `${chunkText} ${groupText}` : chunkText);
    }
    number = Math.floor(number / 1000);
    groupIndex += 1;
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
};

export const formatNumberToWords = (value: number): string => {
  const words = toVietnameseWords(value);
  if (!words) return "";
  const normalized = `${words} đồng`;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
