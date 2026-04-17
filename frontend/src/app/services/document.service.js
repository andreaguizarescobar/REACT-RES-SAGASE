import { fetchAPI } from './api';

export const getDocuments = (token) => {
    return fetchAPI('/documentos/getAll', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const createDocument = (data) => {
    return fetchAPI('/documentos/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const uploadAnexo = (id, formData) => {
    return fetchAPI(`/documentos/${id}/anexo-file`, {
        method: 'POST',
        body: formData,
    });
};

export const updateDocument = (id, data) => {
    return fetchAPI(`/documentos/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteDocument = (id) => {
    return fetchAPI(`/documentos/delete/${id}`, {
        method: 'DELETE',
    });
};

export const getDocumentById = (docId) => {
    return fetchAPI(`/documentos/${docId}`, {
        method: 'GET',
    });
};

export const addTurnado = (id, data) => {
    return fetchAPI(`/documentos/${id}/turnado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addBitacora = (id, data) => {
    return fetchAPI(`/documentos/${id}/bitacora`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addCopia = (id, data) => {
    return fetchAPI(`/documentos/${id}/copia`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addAnexo = (id, data) => {
    return fetchAPI(`/documentos/${id}/anexo`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const removeAnexo = (id, data) => {
    return fetchAPI(`/documentos/${id}/removerAnexo`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const updateStatus = (id, data) => {
    return fetchAPI(`/documentos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addRelacionado = (id, data) => {
    return fetchAPI(`/documentos/${id}/relacionado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const removeRelacionado = (id, data) => {
    return fetchAPI(`/documentos/${id}/removerRelacionado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}; 

