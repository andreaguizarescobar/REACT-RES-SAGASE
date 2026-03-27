import adicionalService from '../services/adicional.service.js';

export const getAllAdicionales = async (req, res) => {
    try {
        const adicionales = await adicionalService.getAllAdicionales();
        res.json(adicionales);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los adicionales', error });
    }
};

export const createAdicional = async (req, res) => {
    try {
        const adicionalData = req.body;
        const nuevoAdicional = await adicionalService.createAdicional(adicionalData);
        res.status(201).json(nuevoAdicional);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el adicional', error });
    }
};

export const updateAdicional = async (req, res) => {
    try {
        const adicionalId = req.params.id;
        const adicionalData = req.body;
        const adicionalActualizado = await adicionalService.updateAdicional(adicionalId, adicionalData);
        res.json(adicionalActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el adicional', error });
    }
};

export const deleteAdicional = async (req, res) => {
    try {
        const adicionalId = req.params.id;
        await adicionalService.deleteAdicional(adicionalId);
        res.json({ message: 'Adicional eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el adicional', error });
        
    }
};

