import areaService from '../services/area.service.js';

export const getAll = async (req, res) => {
    try {
        const areaList = await areaService.getAll();
        res.status(200).json(areaList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createArea = async (req, res) => {
    try {
        const areaData = req.body;
        const newArea = await areaService.createArea(areaData);
        res.status(201).json(newArea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateArea = async (req, res) => {
    try {
        const { clave } = req.params;
        const areaData = req.body;
        const updatedArea = await areaService.updateArea(clave, areaData);
        if (updatedArea) {
            res.status(200).json(updatedArea);
        } else {
            res.status(404).json({ error: 'Área no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteArea = async (req, res) => {
    try {
        const { clave } = req.params;
        const deletedArea = await areaService.deleteArea(clave);
        if (deletedArea) {
            res.status(200).json({ message: 'Área eliminada correctamente' });
        } else {
            res.status(404).json({ error: 'Área no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAll,
    createArea,
    updateArea,
    deleteArea
}