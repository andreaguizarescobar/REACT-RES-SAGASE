import { fetchAPI } from "./api";

export const getFondos = (token) => {
    return fetchAPI('/fondo', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const getFondoById = (id, token) => {
    return fetchAPI(`/fondo/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const createFondo = (data, token) => {
    const isFormData = data instanceof FormData;
    return fetchAPI('/fondo', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const updateFondo = (id, data, token) => {
    const isFormData = data instanceof FormData;
    return fetchAPI(`/fondo/${id}`, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const deleteFondo = (id, token) => {
    return fetchAPI(`/fondo/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}