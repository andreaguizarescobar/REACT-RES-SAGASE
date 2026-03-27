import adicionalModel from '../models/adicional.model.js';

const getAll = async () => {
    return await adicionalModel.find();
};

const create = async (adicionalData) => {
    const newAdicional = new adicionalModel(adicionalData);
    return await newAdicional.save();
};

const updateAdicional = async (adicionalId, adicionalData) => {
    return await adicionalModel.findByIdAndUpdate(adicionalId, adicionalData, { new: true });
};

const deleteAdicional = async (adicionalId) => {
    return await adicionalModel.findByIdAndDelete(adicionalId);
};

export default {
    getAllAdicionales: getAll,
    createAdicional: create,
    updateAdicional: updateAdicional,
    deleteAdicional: deleteAdicional
};