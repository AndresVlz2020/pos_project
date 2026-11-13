// Función utilitaria para generar un reporte institucional en PDF
// Cumple con RFADMIN13, RFADMIN19, RFADMIN25 y RFADMIN31
export async function generatePdfReport({
  headers,
  rows,
  title = "Reporte del Sistema",
  fileName = "report.pdf"
}) {
  // Carga dinámica bajo demanda para reducir el bundle inicial
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || user?.userName || user?.email || "Administrador General";
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  // Encabezado institucional de marca
  doc.setFillColor(11, 19, 43); // #0B132B
  doc.rect(0, 0, 210, 26, "F");

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("D'PIERO • RESTAURANTE, PARRILLA & POS", 14, 11);

  doc.setFontSize(9);
  doc.setTextColor(199, 124, 76); // Terracotta #C77C4C
  doc.text(String(title).toUpperCase(), 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado: ${dateStr} ${timeStr} | Operador: ${userName}`, 14, 23);

  // Tabla con encabezado formal
  autoTable(doc, {
    startY: 32,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [179, 103, 62], // #B3673E Brand Primary
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold"
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(fileName);
}

export default generatePdfReport;
