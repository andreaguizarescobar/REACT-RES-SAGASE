import correspondenciaService from '../services/correspondencia.service.js';

export const getCorrespondenciaList = async (req, res) => {
    try {
        const correspondenciaList = await correspondenciaService.getCorrespondenciaList();
        res.status(200).json(correspondenciaList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCorrespondenciaItem = async (req, res) => {
    try {
        const { id } = req.params;
        const correspondenciaItem = await correspondenciaService.getCorrespondenciaItem(id);
        if (correspondenciaItem) {
            res.status(200).json(correspondenciaItem);
        } else {
            res.status(404).json({ error: 'Correspondencia no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postCorrespondenciaItem = async (req, res) => {
    try {
        const correspondenciaData = req.body;
        const newCorrespondencia = await correspondenciaService.postCorrespondenciaItem(correspondenciaData);
        res.status(201).json(newCorrespondencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putCorrespondenciaItem = async (req, res) => {
    try {
        const { id } = req.params;
        const correspondenciaData = req.body;
        const updatedCorrespondencia = await correspondenciaService.putCorrespondenciaItem(id, correspondenciaData);
        if (updatedCorrespondencia) {
            res.status(200).json(updatedCorrespondencia);
        } else {
            res.status(404).json({ error: 'Correspondencia no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCorrespondenciaItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCorrespondencia = await correspondenciaService.deleteCorrespondenciaItem(id);
        if (deletedCorrespondencia) {
            res.status(200).json({ message: 'Correspondencia eliminada correctamente' });
        } else {
            res.status(404).json({ error: 'Correspondencia no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getCorrespondenciaList,
    getCorrespondenciaItem,
    postCorrespondenciaItem,
    putCorrespondenciaItem,
    deleteCorrespondenciaItem,
};