import model from '../models/instruccion.model.js';

const getAllInstrucciones = async () => {
    return await model.find();
};

const createInstruccion = async (instruccionData) => {
    const newInstruccion = new model(instruccionData);
    return await newInstruccion.save();
};

export default {
    getAllInstrucciones,
    createInstruccion
};