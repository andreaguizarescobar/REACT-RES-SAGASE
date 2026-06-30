import documentoService from '../services/documento.service.js';

export const getAll = async (req, res) => {
    try {
        const documentoList = await documentoService.getAll();
        res.status(200).json(documentoList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const { docId } = req.body; 
        const documentoItem = await documentoService.getById(docId);
        if (documentoItem) {
            res.status(200).json(documentoItem);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Archivo no enviado' });
        }
        const user = req.user; // Obtener el usuario autenticado del token
        const ruta = `../uploads/anexos/${req.file.filename}`;
        const anexoData = {
            registrador: user.id,
            mensaje: 'Documento registrado con anexo',
            ruta: ruta,
            nombre: req.file.originalname,
        };
        const {data} = req.body;
        const documentoData = JSON.parse(data).data; // Manejar ambos casos
        documentoData.anexos = [anexoData];

        const newDocumento = await documentoService.create(documentoData, user);
        res.status(201).json(newDocumento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putDocumento = async (req, res) => {
    try {
        const {docId, documentoData} = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.putDocumento(docId, documentoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
};  

export const patchTurnadoDocumento = async (req, res) => {
    try {
        const { docId, turnadoData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchTurnadoDocumento(docId, turnadoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchBitacoraDocumento = async (req, res) => {
    try {
        const { docId, bitacoraData } = req.body;
        const updatedDocumento = await documentoService.patchBitacoraDocumento(docId, bitacoraData);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchCopiaDocumento = async (req, res) => {
    try {
        const { docId, copiaData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchCopiaDocumento(docId, copiaData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchAnexoDocumento = async (req, res) => {
    try {
        const { docId, anexoData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchAnexoDocumento(docId, anexoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadAnexoDocumento = async (req, res) => {
    try {
        const user = req.user;
        if (!req.file) {
            return res.status(400).json({ error: 'Archivo no enviado' });
        }

        const { mensaje, registrador, nombre, docId } = req.body;
        const ruta = `../uploads/anexos/${req.file.filename}`;
        const anexoData = {
            registrador: registrador || null,
            mensaje: mensaje || '',
            ruta,
            nombre: nombre || req.file.originalname,
            fecha: new Date(),
        };

        const updatedDocumento = await documentoService.patchAnexoDocumento(docId, anexoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchRemoverAnexoDocumento = async (req, res) => {
    try {
        const { docId, anexoData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchRemoverAnexoDocumento(docId, anexoData, user);  
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchStatusDocumento = async (req, res) => {
    try {
        const { docId, statusData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchStatusDocumento(docId, statusData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchRelacionadoDocumento = async (req, res) => {
    try {
        const { docId, relacionadoData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchRelacionadoDocumento(docId, relacionadoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchRemoverRelacionadoDocumento = async (req, res) => {
    try {        const { docId, relacionadoData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchRemoverRelacionadoDocumento(docId, relacionadoData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchAgregarAdicionalDocumento = async (req, res) => {
    try {
        const { docId, adicionalData } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchAgregarAdicionalDocumento(docId, adicionalData, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchEliminarAdicionalDocumento = async (req, res) => {
    try {
        const { docId, adicionalId } = req.body;
        const user = req.user;
        const updatedDocumento = await documentoService.patchEliminarAdicionalDocumento(docId, adicionalId, user);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDocumento = async (req, res) => {
    try {
        const { docId } = req.body;
        const user = req.user;
        const deletedDocumento = await documentoService.deleteDocumento(docId, user);
        if (deletedDocumento) {
            res.status(200).json({ message: 'Documento eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reporteAcuerdos = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.body;
        const acuerdos = await documentoService.reporteAcuerdos(fechaInicio, fechaFin);
        res.status(200).json(acuerdos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reporteAsuntos = async (req, res) => {
    try {
        const filtro = req.body;
        const asuntos = await documentoService.reporteAsuntos(filtro);
        res.status(200).json(asuntos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const patchRespuestaDocumento = async (req, res) => {
    try {
        const ruta = req.file ? `../uploads/anexos/${req.file.filename}` : null;
        const { docId, mensaje, anexos, nombre } = req.body;
        const user = req.user;

        let respuestaData = mensaje;
        if (typeof respuestaData === 'string') {
            try {
                respuestaData = JSON.parse(respuestaData);
            } catch (e) {
                respuestaData = { mensaje: respuestaData, nombre: nombre || null };
            }
        }

        if (!respuestaData || typeof respuestaData !== 'object') {
            respuestaData = { mensaje: String(mensaje || ''), nombre: nombre || null };
        }

        const updatedDocumento = await documentoService.patchRespuestaDocumento(docId, respuestaData, user, ruta);
        if (updatedDocumento) {
            res.status(200).json(updatedDocumento);
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchDocumentos = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'La búsqueda debe tener al menos 2 caracteres' });
        }
        const resultados = await documentoService.searchDocumentos(query);
        res.status(200).json(resultados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAll,
    getById,
    create,
    putDocumento,
    patchCopiaDocumento,
    patchAnexoDocumento,
    uploadAnexoDocumento,
    patchRemoverAnexoDocumento,
    patchStatusDocumento,
    patchRelacionadoDocumento,
    patchRespuestaDocumento,
    patchRemoverRelacionadoDocumento,
    deleteDocumento,
    reporteAcuerdos,
    reporteAsuntos,
    searchDocumentos
};