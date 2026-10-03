// Función utilitaria para construir el dataset de un reporte (tabla)
// Patrón: transformación de datos (input -> output listo para exportar)

export function buildReportDataset({
  users,          // Array de usuarios origen
  selectedFields, // Campos seleccionados para el reporte [{ key, label }]
  scope,          // Alcance del reporte: "all"
  documentNumber  // Número de documento para filtrar (si aplica)
}) {

  // Copia inmutable del array original (evita mutaciones)
  let filteredUsers = [...users];

  // Filtro por alcance según el requerimiento RFADMIN07
  if (scope === "enabled") {
    filteredUsers = filteredUsers.filter((u) => u.isActive !== false && u.status !== "Inactivo");
  } else if (scope === "disabled") {
    filteredUsers = filteredUsers.filter((u) => u.isActive === false || u.status === "Inactivo");
  } else if (scope === "document" && documentNumber) {
    filteredUsers = filteredUsers.filter(
      (user) => String(user.document_number || user.userDocumentNumber || "").trim() === String(documentNumber).trim()
    );
  }


  // Construcción de encabezados del reporte
  // Se toma el label de cada campo seleccionado
  const headers = selectedFields.map((field) => field.label);

  // Construcción de filas del reporte
  // Cada usuario se transforma en un array de valores según los campos seleccionados
  const rows = filteredUsers.map((user) =>
    selectedFields.map((field) => {
      const value = user[field.key]; // Acceso dinámico a la propiedad

      // Normalización: evita undefined o null en el reporte
      return value ?? "";
    })
  );

  // Estructura final desacoplada de la UI
  // Lista para exportar a Excel, PDF o renderizar en tabla
  return {
    headers, // Array de strings (columnas)
    rows     // Array de arrays (filas)
  };
}
