import seccionModel from "../models/seccion.model";

export const getAll = async () => {
    return await seccionModel.find();
};

export const getById = async (seccionId) => {
    return await seccionModel.find({ seccionId });
};

export const createSeccion = async (seccionData) => {
    const newSeccion = new seccionModel(seccionData);
    return await newSeccion.save();
};

export const updateSeccion = async (seccionId, seccionData) => {
    return await seccionModel.findOneAndUpdate({ seccionId }, seccionData, { new: true });
};

export const deleteSeccion = async (seccionId) => {
    return await seccionModel.findOneAndDelete({ seccionId });
};

export const addSerieToSeccion = async (seccionId, serieData) => {
    return await seccionModel.findOneAndUpdate(
        { seccionId },
        { $push: { series: serieData } },
        { new: true }
    );
};

export const removeSerieFromSeccion = async (seccionId, serieId) => {
    return await seccionModel.findOneAndUpdate(
        { seccionId },
        { $pull: { series: { _id: serieId } } },
        { new: true }
    );
};

export const addSubserieToSerie = async (seccionId, serieId, subserieData) => {
    return await seccionModel.findOneAndUpdate(
        { seccionId, "series.serie": serieId },
        { $push: { "series.$.subseries": subserieData } },
        { new: true }
    );
};

export const removeSubserieFromSerie = async (seccionId, serieId, subserieId) => {
    return await seccionModel.findOneAndUpdate(
        { seccionId, "series.serie": serieId },
        { $pull: { "series.$.subseries": { _id: subserieId } } },
        { new: true }
    );
};
