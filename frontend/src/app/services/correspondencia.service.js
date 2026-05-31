import { fetchAPI } from "./api";

// Obtener todas las correspondencias, opcionalmente con filtro de fechas
export const getCorrespondencias = async ({ fechaInicio, fechaFin } = {}) => {
    const query = new URLSearchParams();
    if (fechaInicio) query.append('fechaInicio', fechaInicio);
    if (fechaFin) query.append('fechaFin', fechaFin);

    const endpoint = query.toString() ? `/correspondencia?${query.toString()}` : '/correspondencia';
    return fetchAPI(endpoint, {
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
