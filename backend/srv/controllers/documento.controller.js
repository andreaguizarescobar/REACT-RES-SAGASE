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
        const { docId } = req.params;
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
        const documentoData = req.body;
        const newDocumento = await documentoService.create(documentoData);
        res.status(201).json(newDocumento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putDocumento = async (req, res) => {
    try {
        const { docId } = req.params;
        const documentoData = req.body;
        const updatedDocumento = await documentoService.putDocumento(docId, documentoData);
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
        const { docId } = req.params;
        const turnadoData = req.body;
        const updatedDocumento = await documentoService.patchTurnadoDocumento(docId, turnadoData);
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
        const { docId } = req.params;
        const bitacoraData = req.body;
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
        const { docId } = req.params;
        const copiaData = req.body;
        const updatedDocumento = await documentoService.patchCopiaDocumento(docId, copiaData);
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
        const { docId } = req.params;
        const anexoData = req.body;
        const updatedDocumento = await documentoService.patchAnexoDocumento(docId, anexoData);
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
        const { docId } = req.params;
        const anexoData = req.body;
        const updatedDocumento = await documentoService.patchRemoverAnexoDocumento(docId, anexoData);  
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
        const { docId } = req.params;
        const statusData = req.body;
        const updatedDocumento = await documentoService.patchStatusDocumento(docId, statusData);
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
        const { docId } = req.params;
        const relacionadoData = req.body;
        const updatedDocumento = await documentoService.patchRelacionadoDocumento(docId, relacionadoData);
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
    try {        const { docId } = req.params;
        const relacionadoData = req.body;
        const updatedDocumento = await documentoService.patchRemoverRelacionadoDocumento(docId, relacionadoData);
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
        const { docId } = req.params;
        const deletedDocumento = await documentoService.deleteDocumento(docId);
        if (deletedDocumento) {
            res.status(200).json({ message: 'Documento eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
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
    patchRemoverAnexoDocumento,
    patchStatusDocumento,
    patchRelacionadoDocumento,
    patchRemoverRelacionadoDocumento,
    deleteDocumento
};