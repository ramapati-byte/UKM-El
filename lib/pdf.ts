// lib/pdf.ts — Generator PDF (%PDF-1.4) & CSV sederhana tanpa dependensi eksternal

function escapePdfText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Membuat Blob PDF (%PDF-1.4) yang valid dan dapat dibuka di browser/PDF viewer */
export function buildSimplePdfBlob(title: string, lines: string[]): Blob {
  const safeTitle = escapePdfText(title);
  const maxLines = lines.slice(0, 42).map((l) => escapePdfText(l.slice(0, 95)));

  const streamParts: string[] = [
    "BT",
    "/F1 14 Tf",
    "50 780 Td",
    `(${safeTitle}) Tj`,
    "/F1 10 Tf",
    "0 -24 Td",
  ];

  for (const line of maxLines) {
    streamParts.push(`(${line}) Tj`);
    streamParts.push("0 -15 Td");
  }
  streamParts.push("ET");

  const streamContent = streamParts.join("\n");
  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

/** Membuat Blob CSV (kompatibel Excel) dengan BOM UTF-8 */
export function buildCsvBlob(headers: string[], rows: Array<Array<string | number>>): Blob {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvLines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ];
  return new Blob(["\uFEFF" + csvLines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
}
