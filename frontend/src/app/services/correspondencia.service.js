import { fetchAPI } from "./api";

// Obtener todas las correspondencias
export const getCorrespondencias = async () => {
    return fetchAPI('/correspondencia', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
};

// Buscar documentos
export const searchDocumentos = async (query) => {
    return fetchAPI('/documentos/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
};

// Crear correspondencia de salida
export const createCorrespondenciaSalida = async (correspondenciaData) => {
    return fetchAPI('/correspondencia/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correspondenciaData)
    });
};
