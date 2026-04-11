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

export default {
    getAllInstrucciones,
    createInstruccion
};