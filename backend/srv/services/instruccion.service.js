import model from '../models/instruccion.model.js';

const getAllInstrucciones = async () => {
    return await model.find();
};

const createInstruccion = async (instruccionData) => {
    const newInstruccion = new model(instruccionData);
    return await newInstruccion.save();
};

const updateInstruccion = async (id, data) => {
    return await model.findByIdAndUpdate(id, data, { new: true });
};

const deleteInstruccion = async (id) => {
    return await model.findByIdAndDelete(id);
};

export default {
    getAllInstrucciones,
    createInstruccion,
    updateInstruccion,
    deleteInstruccion
};
