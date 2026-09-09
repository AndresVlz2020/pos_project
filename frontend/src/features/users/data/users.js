// Nombre, rol, estado del trabajador, correo (solo admin), teléfono, tipos de documento, número de documento

export const users = [
  { id: 1, userName: "Administrador General", role: "Administrador", workerStatus: "En Turno", userEmail: "admin@dpiero.com", userPhone: "3150000000", document_type: "CC", document_number: "1000000001", address: "Sede Principal", isActive: true },
  { id: 2, userName: "Carlos Pérez", role: "Cajero", workerStatus: "En Turno", userPhone: "3152345678", document_type: "CC", document_number: "1001234567", address: "Calle 1 #10-20", isActive: true },
  { id: 3, userName: "María Rodríguez", role: "Mesero", workerStatus: "En Turno", userPhone: "3104567890", document_type: "CC", document_number: "1002345678", address: "Carrera 2 #20-30", isActive: true },
  { id: 4, userName: "Juan Gómez", role: "Cocinero", workerStatus: "En Turno", userPhone: "3001234567", document_type: "CC", document_number: "1003456789", address: "Avenida 3 #30-40", isActive: true },
  { id: 5, userName: "Ana Martínez", role: "Cajero", workerStatus: "En Turno", userPhone: "3209876543", document_type: "CC", document_number: "1004567890", address: "Calle 4 #40-50", isActive: true },
  { id: 6, userName: "Santiago Castro", role: "Mesero", workerStatus: "Disponible", userPhone: "3001234567", document_type: "CC", document_number: "1005678901", address: "Carrera 5 #50-60", isActive: true },
  { id: 7, userName: "Sofia Jaramillo", role: "Cajero", workerStatus: "En Pausa", userPhone: "3127654321", document_type: "CC", document_number: "1006789012", address: "Calle 6 #60-70", isActive: true },
  { id: 8, userName: "Mateo Holguín", role: "Cocinero", workerStatus: "Fuera de Turno", userPhone: "3145678901", document_type: "TI", document_number: "1007890123", address: "Avenida 7 #70-80", isActive: false },
  { id: 9, userName: "Valentina Ortiz", role: "Mesero", workerStatus: "En Turno", userPhone: "3182345678", document_type: "CC", document_number: "1008901234", address: "Calle 8 #80-90", isActive: true },
  { id: 10, userName: "Daniela Rios", role: "Mesero", workerStatus: "Disponible", userPhone: "3218765432", document_type: "CC", document_number: "1009012345", address: "Carrera 9 #90-100", isActive: true },
  { id: 11, userName: "Alejandro Silva", role: "Cajero", workerStatus: "En Turno", userPhone: "3112345678", document_type: "CC", document_number: "1010123456", address: "Calle 10 #10-20", isActive: true },
  { id: 12, userName: "Camila Torres", role: "Mesero", workerStatus: "Disponible", userPhone: "3169876543", document_type: "CC", document_number: "1011234567", address: "Carrera 11 #11-22", isActive: true },
  { id: 13, userName: "Juan Pablo Marín", role: "Cocinero", workerStatus: "Fuera de Turno", userPhone: "3012345678", document_type: "CE", document_number: "1012345678", address: "Avenida 12 #12-24", isActive: false },
  { id: 14, userName: "Gabriela Espinal", role: "Cajero", workerStatus: "Disponible", userPhone: "3177654321", document_type: "CC", document_number: "1013456789", address: "Calle 13 #13-26", isActive: true },
  { id: 15, userName: "Nicolás Correa", role: "Mesero", workerStatus: "En Turno", userPhone: "3135678901", document_type: "CC", document_number: "1014567890", address: "Carrera 14 #14-28", isActive: true },
  { id: 16, userName: "Manuela Duque", role: "Mesero", workerStatus: "Disponible", userPhone: "3192345678", document_type: "TI", document_number: "1015678901", address: "Calle 15 #15-30", isActive: true }
];