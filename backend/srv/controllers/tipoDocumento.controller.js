import tipoDocumentoService from '../services/tipoDocumento.service.js';

export const getAll = async (req, res) => {
  try {
    const tipoDocumentos = await tipoDocumentoService.getAll();
    res.json(tipoDocumentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTipoDocumento = async (req, res) => {
    try {
        const { tipo } = req.params;
        const tipoDocumento = await tipoDocumentoService.getTipoDocumento(tipo);
        if (!tipoDocumento) {
            return res.status(404).json({ error: "Tipo de documento no encontrado" });
        }
        res.json(tipoDocumento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postTipoDocumento = async (req, res) => {
    try {
        const data = req.body;
        const newTipoDocumento = await tipoDocumentoService.postTipoDocumento(data);
        res.status(201).json(newTipoDocumento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putTipoDocumento = async (req, res) => {
    try {
        const { tipo } = req.params;
        const data = req.body;
        const updatedTipoDocumento = await tipoDocumentoService.putTipoDocumento(tipo, data);
        if (!updatedTipoDocumento) {
            return res.status(404).json({ error: "Tipo de documento no encontrado" });
        }
        res.json(updatedTipoDocumento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTipoDocumento = async (req, res) => {
    try {
        const { tipo } = req.params;
        const deletedTipoDocumento = await tipoDocumentoService.deleteTipoDocumento(tipo);
        if (deletedTipoDocumento.deletedCount === 0) {
            return res.status(404).json({ error: "Tipo de documento no encontrado" });
        }
        res.json({ message: "Tipo de documento eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};