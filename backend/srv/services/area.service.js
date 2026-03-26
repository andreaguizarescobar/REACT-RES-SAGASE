import areaModel from "../models/area.model";

const getAll = async () => {
    return await areaModel.find();
};

const createArea = async (areaData) => {
    const newArea = new areaModel(areaData);
    return await newArea.save();
};

const updateArea = async (clave, areaData) => {
    return await areaModel.findOneAndUpdate({ clave }, areaData, { new: true });
};

const deleteArea = async (clave) => {
    return await areaModel.findOneAndDelete({ clave });
};

export default {
    getAll,
    createArea,
    updateArea,
    deleteArea
}