import procesoService from '../services/proceso.service.js';

export const getProcesoList = async (req, res) => {
    try {
        const procesoList = await procesoService.getProcesoList();
        res.status(200).json(procesoList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProcesoItem = async (req, res) => {
    try {
        const { id } = req.params;
        const procesoItem = await procesoService.getProcesoItem(id);
        if (procesoItem) {
            res.status(200).json(procesoItem);
        } else {
            res.status(404).json({ message: 'Proceso not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const postProcesoItem = async (req, res) => {
    try {
        const procesoData = req.body;
        const newProceso = await procesoService.postProcesoItem(procesoData);
        res.status(201).json(newProceso);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const putProcesoItem = async (req, res) => {
    try {
        const { id } = req.params;
        const procesoData = req.body;
        const updatedProceso = await procesoService.putProcesoItem(id, procesoData);
        if (updatedProceso) {
            res.status(200).json(updatedProceso);
        }
        else {
            res.status(404).json({ message: 'Proceso not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProcesoItem = async (req, res) => {
    try {        const { id } = req.params;
        const deletedProceso = await procesoService.deleteProcesoItem(id);
        if (deletedProceso) {
            res.status(200).json({ message: 'Proceso deleted successfully' });
        } else {
            res.status(404).json({ message: 'Proceso not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getProcesoList,
    getProcesoItem,
    postProcesoItem,
    putProcesoItem,
    deleteProcesoItem
};