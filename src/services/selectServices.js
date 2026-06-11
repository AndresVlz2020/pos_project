export async function getDocumentTypes() {
    const response = await fetch(`src/selects/documentTypes.json`)
    return(response.json());
}