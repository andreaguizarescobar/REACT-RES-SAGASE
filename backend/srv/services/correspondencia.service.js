import model from '../models/correspondencia.model.js';

const getCorrespondenciaList = async ({ fechaInicio, fechaFin } = {}) => {
    const filtro = {};

    if (fechaInicio || fechaFin) {
        filtro.fecha = {};

        if (fechaInicio) {
            filtro.fecha.$gte = new Date(fechaInicio);
        }

        if (fechaFin) {
            const fechaFinDate = new Date(fechaFin);
            fechaFinDate.setHours(23, 59, 59, 999);
            filtro.fecha.$lte = fechaFinDate;
        }
    }

    return await model
        .find(filtro)
        .populate('remitente', 'name cargo')
        .populate('destinatario', 'name cargo')
        .populate('doc', 'docId')
        .sort({ fecha: 1 });
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

export default { getCorrespondenciaList, getCorrespondenciaItem, postCorrespondenciaItem, putCorrespondenciaItem, deleteCorrespondenciaItem };