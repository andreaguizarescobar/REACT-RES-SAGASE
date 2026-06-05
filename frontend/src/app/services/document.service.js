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
        body: data
    });
};

export const uploadAnexo = (formData, token) => {
    return fetchAPI(`/documentos/anexo-file`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData,
    });
};

export const updateDocument = (id, data, token) => {
    return fetchAPI(`/documentos/update`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, documentoData: data})
    });
};

export const deleteDocument = (id, token) => {
    return fetchAPI(`/documentos/delete`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
        , body: JSON.stringify({ docId: id})
    });
};

export const getDocumentById = (docId, token) => {
    return fetchAPI(`/documentos`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
        , body: JSON.stringify({docId})
    });
};

export const addTurnado = (id, data, token) => {
    return fetchAPI(`/documentos/turnado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, turnadoData: data })
    });
};

export const addBitacora = (id, data, token) => {
    return fetchAPI(`/documentos/bitacora`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, bitacoraData: data})
    });
};

export const addCopia = (id, data, token) => {
    return fetchAPI(`/documentos/copia`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, copiaData: data })
    });
};

export const addAnexo = (id, data, token) => {
    return fetchAPI(`/documentos/anexo`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, anexoData: data })
    });
};

export const removeAnexo = (id, data, token) => {
    return fetchAPI(`/documentos/removerAnexo`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, anexoData: data })
    });
};

export const updateStatus = (id, data, token) => {
    return fetchAPI(`/documentos/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, statusData: data })
    });
};

export const addRelacionado = (id, data, token) => {
    return fetchAPI(`/documentos/relacionado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, relacionadoData: data })
    });
};

export const removeRelacionado = (id, data, token) => {
    return fetchAPI(`/documentos/removerRelacionado`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, relacionadoData: data })
    });
}; 

export const reporteAcuerdos = (data, token) => {
    return fetchAPI(`/documentos/reporte/acuerdos`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const reporteAsuntos = (data, token) => {
    console.log('Enviando datos para reporte de asuntos:', data);
    return fetchAPI(`/documentos/reporte/asuntos`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
};

export const enviarRespuesta = (formData, token) => {
    return fetchAPI(`/documentos/respuesta`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData,
    });
};

