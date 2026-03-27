import { fetchAPI } from "./api";

export const getTipoDocument = () => {
    return fetchAPI('/tipoDocument/getAll', {
        method: 'GET',
    });
}

export const createTipoDocument = (data) => {
    return fetchAPI('/tipoDocument/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateTipoDocument = (id, data) => {
    return fetchAPI(`/tipoDocument/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const deleteTipoDocument = (id) => {
    return fetchAPI(`/tipoDocument/delete/${id}`, {
        method: 'DELETE',
    });
}
