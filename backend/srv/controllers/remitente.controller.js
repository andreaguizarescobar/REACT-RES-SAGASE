import servicioRemitente from '../services/remitente.service.js';

export const getAll = async (req, res) => {
    try {
        const data = await servicioRemitente.getAllRemitentes();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRemitente = async (req, res) => {
    const { remId } = req.params;
    try {
        const data = await servicioRemitente.getRemitenteById(remId);
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ error: `Remitente con id: ${remId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postRemitente = async (req, res) => {
    const remitenteData = req.body;
    try {
        const newRemitente = await servicioRemitente.createRemitente(remitenteData);
        res.status(201).json(newRemitente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putRemitente = async (req, res) => {
    const { remId } = req.params;
    const remitenteData = req.body;
    try {
        const updatedRemitente = await servicioRemitente.updateRemitente(remId, remitenteData);
        if (updatedRemitente) {
            res.json(updatedRemitente);
        } else {
            res.status(404).json({ error: `Remitente con id: ${remId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRemitente = async (req, res) => {
    const { remId } = req.params;
    try {
        const deletedRemitente = await servicioRemitente.deleteRemitente(remId);
        if (deletedRemitente) {
            res.json({ message: `Remitente con id: ${remId} eliminado` });
        }
        else {
            res.status(404).json({ error: `Remitente con id: ${remId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAll,
    getRemitente,
    postRemitente,
    putRemitente,
    deleteRemitente
};