import { fetchAPI } from "./api";

export const getTemaPrincipal = () => {
    return fetchAPI('/temaPrincipal/getAll', {
        method: 'GET',
    });
}

export const getAdicional = () => {
    return fetchAPI('/adicional/getAll', {
        method: 'GET',
    });
}

export const getAreas = () => {
    return fetchAPI('/areas/getAll', {
        method: 'GET',
    });
}