import { fetchAPI } from "./api";

export const getTemaPrincipal = () => {
    return fetchAPI('/temaPrincipal/getAll', {
        method: 'GET',
    });
}

export const getAreas = () => {
    return fetchAPI('/areas/getAll', {
        method: 'GET',
    });
}

export const createArea = (data) => {
    return fetchAPI('/areas/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateArea = (id, data) => {
    return fetchAPI(`/areas/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const getInstrucciones = () => {
    return fetchAPI('/instruccion/getAll', {
        method: 'GET',
    });
}

export const createTemaPrincipal = (data) => {
    return fetchAPI('/temaPrincipal/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateTemaPrincipal = (id, data) => {
    return fetchAPI(`/temaPrincipal/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const deleteTemaPrincipal = (id) => {
    return fetchAPI(`/temaPrincipal/delete/${id}`, {
        method: 'DELETE',
    });
}

export const createInstruccion = (data) => {
    return fetchAPI('/instruccion/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateInstruccion = (id, data) => {
    return fetchAPI(`/instruccion/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const deleteInstruccion = (id) => {
    return fetchAPI(`/instruccion/delete/${id}`, {
        method: 'DELETE',
    });
}
