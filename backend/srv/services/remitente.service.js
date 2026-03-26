import remitenteModel from '../models/remitente.model.js';

export const getAllRemitentes = async () => {
    return await remitenteModel.find();
};

export const getRemitenteById = async (remId) => {
    return await remitenteModel.findOne({ remId });
};

export const createRemitente = async (remitenteData) => {
    const remitenteExists = await remitenteModel.findOne({ remId: remitenteData.remId });
    if (remitenteExists) {
        throw new Error(`El remitente con id: ${remitenteData.remId} ya existe`);
    }
    const newRemitente = await remitenteModel.create(remitenteData);
    return newRemitente;
};

export const updateRemitente = async (remId, remitenteData) => {
    const updatedRemitente = await remitenteModel.findOneAndUpdate({ remId }, remitenteData, { new: true });
    if (!updatedRemitente) {
        throw new Error(`No se encontró el remitente con id: ${remId}`);
    }
    return updatedRemitente;
};

export const deleteRemitente = async (remId) => {
    return await remitenteModel.findOneAndDelete({ remId });
};

export default {
    getAllRemitentes,
    getRemitenteById,
    createRemitente,
    updateRemitente,
    deleteRemitente
};