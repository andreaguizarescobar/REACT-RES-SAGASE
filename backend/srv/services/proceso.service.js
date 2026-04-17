import procesoModel from "../models/proceso.model.js";

export const getProcesoList = async () => {
    return await procesoModel.find();
};

export const getProcesoItem = async (id) => {
    return await procesoModel.find({ processId: id });
};

export const postProcesoItem = async (procesoData) => {
    return await procesoModel.create(procesoData);
};

export const putProcesoItem = async (id, procesoData) => {
    const procesoItem = await procesoModel.find({ processId: id });
    if (procesoItem) {
        return await procesoItem.update(procesoData);
    }
    return null;
};

export const deleteProcesoItem = async (id) => {
    const procesoItem = await procesoModel.find({ processId: id });
    if (procesoItem) {
        await procesoItem.destroy();
        return true;
    }
    return false;
};

export default {
    getProcesoList,
    getProcesoItem,
    postProcesoItem,
    putProcesoItem,
    deleteProcesoItem
};