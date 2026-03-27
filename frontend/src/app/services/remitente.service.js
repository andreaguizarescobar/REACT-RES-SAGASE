import { fetchAPI } from "./api";

export const getRemitentes = () => {
    return fetchAPI('/remitentes/getAll', {
        method: 'GET',
    });
}

export const createRemitente = (data) => {
    return fetchAPI('/remitentes/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateRemitente = (id, data) => {
    return fetchAPI(`/remitentes/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const deleteRemitente = (id) => {
    return fetchAPI(`/remitentes/delete/${id}`, {
        method: 'DELETE',
    });
}

export const getRemitenteById = (id) => {
    return fetchAPI(`/remitentes/${id}`, {
        method: 'GET',
    });
}

