import { fetchAPI } from "./api";

export const getFondos = () => {
    return fetchAPI('/fondo', {
        method: 'GET',
    });
}

export const getFondoById = (id) => {
    return fetchAPI(`/fondo/${id}`, {
        method: 'GET',
    });
}

export const createFondo = (data) => {
    const isFormData = data instanceof FormData;
    return fetchAPI('/fondo', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : {
            'Content-Type': 'application/json'
        }
    });
}

export const updateFondo = (id, data) => {
    const isFormData = data instanceof FormData;
    return fetchAPI(`/fondo/${id}`, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : {
            'Content-Type': 'application/json'
        }
    });
}

export const deleteFondo = (id) => {
    return fetchAPI(`/fondo/${id}`, {
        method: 'DELETE',
    });
}