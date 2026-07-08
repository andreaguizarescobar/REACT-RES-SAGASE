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

export const deleteDocument = (id, motivo, token) => {
    return fetchAPI(`/documentos/delete`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, motivo })
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

export const addAdicional = (id, data, token) => {
    return fetchAPI(`/documentos/agregarAdicional`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, adicionalData: data })
    });
};

export const removeAdicional = (id, adicionalId, token) => {
    return fetchAPI(`/documentos/eliminarAdicional`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ docId: id, adicionalId: adicionalId })
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

export const getEliminados = (token) => {
    return fetchAPI(`/documentos/eliminados`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

