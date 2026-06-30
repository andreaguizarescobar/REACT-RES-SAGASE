import instruccionService from "../services/instruccion.service.js";

export const getAllInstrucciones = async (req, res) => {
    try {
        const instrucciones = await instruccionService.getAllInstrucciones();
        res.status(200).json(instrucciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las instrucciones', error });
    }
};

export const createInstruccion = async (req, res) => {
    try {
        const { descripcion } = req.body;
        const newInstruccion = await instruccionService.createInstruccion({ descripcion });
        res.status(201).json(newInstruccion);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la instrucción', error });
    }
};

export const updateInstruccion = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedInstruccion = await instruccionService.updateInstruccion(id, data);
        if (!updatedInstruccion) {
            return res.status(404).json({ message: 'Instrucción no encontrada' });
        }
        res.status(200).json(updatedInstruccion);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la instrucción', error });
    }
};

export const deleteInstruccion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInstruccion = await instruccionService.deleteInstruccion(id);
        if (!deletedInstruccion) {
            return res.status(404).json({ message: 'Instrucción no encontrada' });
        }
        res.status(200).json({ message: 'Instrucción eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la instrucción', error });
    }
};

export default {
    getAllInstrucciones,
    createInstruccion,
    updateInstruccion,
    deleteInstruccion
};
