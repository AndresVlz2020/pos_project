// Función utilitaria para construir el dataset de un reporte (tabla)
// Patrón: transformación de datos (input -> output listo para exportar)

export function buildReportDataset({
  users,          // Array de usuarios origen
  selectedFields, // Campos seleccionados para el reporte [{ key, label }]
  scope,          // Alcance del reporte: "all", "enabled", "disabled", "document"
  documentNumber  // Número de documento para filtrar (si aplica)
}) {

  // Copia inmutable del array original (evita mutaciones)
  let filteredUsers = [...users];

  // Filtro por alcance según el requerimiento RFADMIN07
  if (scope === "enabled") {
    filteredUsers = filteredUsers.filter((u) => {
      const active = u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : (u.estado !== undefined ? u.estado : true));
      return Boolean(active);
    });
  } else if (scope === "disabled") {
    filteredUsers = filteredUsers.filter((u) => {
      const active = u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : (u.estado !== undefined ? u.estado : true));
      return !Boolean(active);
    });
  } else if (scope === "document" && documentNumber) {
    filteredUsers = filteredUsers.filter(
      (user) => String(user.document_number || user.userDocumentNumber || user.id || "").trim() === String(documentNumber).trim()
    );
  }

  // Construcción de encabezados del reporte
  const headers = selectedFields.map((field) => field.label);

  // Construcción de filas del reporte con mapeo inteligente
  const rows = filteredUsers.map((user) =>
    selectedFields.map((field) => {
      const key = field.key;
      const k = String(key || "").toLowerCase();

      // 1. Manejo especial para el estado (convierte booleanos/valores en "Activo" / "Inactivo")
      if (k.includes("active") || k.includes("status") || k.includes("estado")) {
        const rawStatus = user.isActive ?? user.is_active ?? user.status ?? user.estado;
        if (rawStatus === false || rawStatus === 0 || rawStatus === "Inactivo" || rawStatus === "disabled") {
          return "Inactivo";
        }
        return "Activo";
      }

      // 2. Acceso directo o búsqueda flexible de propiedades (PostgreSQL vs Frontend)
      let value = user[key];
      if (value === undefined || value === null || value === "") {
        if (k.includes("name") || k.includes("nombre")) {
          value = user.name || user.user_name || user.userName || user.nombre || user.full_name || "";
        } else if (k.includes("email") || k.includes("correo")) {
          value = user.email || user.user_email || user.userEmail || "";
        } else if (k.includes("document") || k.includes("id") || k.includes("cedula")) {
          value = user.document_number || user.userDocumentNumber || user.id || "";
        } else if (k.includes("phone") || k.includes("telefono") || k.includes("celular")) {
          value = user.phone || user.userPhone || user.telefono || "";
        } else if (k.includes("type") || k.includes("role") || k.includes("rol")) {
          value = user.document_type || user.role || user.rol || user.userType || "";
        }
      }

      // 3. Normalización final: evita undefined o null
      return value !== undefined && value !== null ? value : "";
    })
  );

  // Estructura final desacoplada de la UI
  return {
    headers, // Array de strings (columnas)
    rows     // Array de arrays (filas)
  };
}

export default buildReportDataset;