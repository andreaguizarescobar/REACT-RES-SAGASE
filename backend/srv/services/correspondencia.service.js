import model from '../models/correspondencia.model.js';

const getCorrespondenciaList = async () => {
    return await model.find();
};

const getCorrespondenciaItem = async (id) => {
    return await model.findById(id);
};

const postCorrespondenciaItem = async (correspondenciaData) => {
    const newCorrespondencia = new model(correspondenciaData);
    return await newCorrespondencia.save();
};

const putCorrespondenciaItem = async (id, correspondenciaData) => {
    return await model.findByIdAndUpdate(id, correspondenciaData, { new: true });
};

const deleteCorrespondenciaItem = async (id) => {
    return await model.findByIdAndDelete(id);
};

export default { getCorrespondenciaList };