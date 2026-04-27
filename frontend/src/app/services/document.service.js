import { fetchAPI } from './api';

export const getDocuments = (token) => {
    return fetchAPI('/documentos/getAll', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const createDocument = (data, token) => {
    return fetchAPI('/documentos/create', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const uploadAnexo = (id, formData, token) => {
    return fetchAPI(`/documentos/${id}/anexo-file`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData,
    });
};

export const updateDocument = (id, data, token) => {
    return fetchAPI(`/documentos/update/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const deleteDocument = (id, token) => {
    return fetchAPI(`/documentos/delete/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getDocumentById = (docId, token) => {
    return fetchAPI(`/documentos/${docId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const addTurnado = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/turnado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const addBitacora = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/bitacora`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const addCopia = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/copia`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const addAnexo = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/anexo`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const removeAnexo = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/removerAnexo`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const updateStatus = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const addRelacionado = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/relacionado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const removeRelacionado = (id, data, token) => {
    return fetchAPI(`/documentos/${id}/removerRelacionado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
}; 

export const reporteAcuerdos = (data, token) => {
    console.log(data)
    return fetchAPI(`/documentos/reporte/acuerdos`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

