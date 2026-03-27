import ferchAPI from './api';

export const getDocuments = () => {
    return ferchAPI('/documentos/getAll', {
        method: 'GET',
    });
};

export const createDocument = (data) => {
    return ferchAPI('/documentos/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateDocument = (id, data) => {
    return ferchAPI(`/documentos/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteDocument = (id) => {
    return ferchAPI(`/documentos/delete/${id}`, {
        method: 'DELETE',
    });
};

export const getDocumentById = (id) => {
    return ferchAPI(`/documentos/${id}`, {
        method: 'GET',
    });
};

export const addTurnado = (id, data) => {
    return ferchAPI(`/documentos/${id}/turnado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addBitacora = (id, data) => {
    return ferchAPI(`/documentos/${id}/bitacora`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addCopia = (id, data) => {
    return ferchAPI(`/documentos/${id}/copia`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addAnexo = (id, data) => {
    return ferchAPI(`/documentos/${id}/anexo`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const removeAnexo = (id, data) => {
    return ferchAPI(`/documentos/${id}/removerAnexo`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const updateStatus = (id, data) => {
    return ferchAPI(`/documentos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const addRelacionado = (id, data) => {
    return ferchAPI(`/documentos/${id}/relacionado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};

export const removeRelacionado = (id, data) => {
    return ferchAPI(`/documentos/${id}/removerRelacionado`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}; 

