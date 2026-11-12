import documentTypes from "../selects/documentTypes.json";

export async function getDocumentTypes() {
  return documentTypes.map((doc) => ({
    id: doc.id,
    value: doc.id,
    label: doc.label,
  }));
}
