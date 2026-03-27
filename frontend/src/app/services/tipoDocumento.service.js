import { fetchAPI } from "./api";

export const getTipoDocument = () => {
    return fetchAPI('/tipoDocumento/getAll', {
        method: 'GET',
    });
}

export const createTipoDocument = (data) => {
    return fetchAPI('/tipoDocumento/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateTipoDocument = (id, data) => {
    return fetchAPI(`/tipoDocumento/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const deleteTipoDocument = (id) => {
    return fetchAPI(`/tipoDocument/delete/${id}`, {
        method: 'DELETE',
    });
}
