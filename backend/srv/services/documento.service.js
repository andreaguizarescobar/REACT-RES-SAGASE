import documentoModel from '../models/documento.model.js';

const getAll = async () => {
    return await documentoModel.find();
};

const getById = async (docId) => {
    return await documentoModel.findOne({ docId });
};

const create = async (documentoData) => {
    const newDocumento = new documentoModel(documentoData);
    return await newDocumento.save();
};
const putDocumento = async (docId, documentoData) => {
    return await documentoModel.findOneAndUpdate({ docId }, documentoData, { new: true });
};

const patchTurnadoDocumento = async (docId, turnadoData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { turnado: turnadoData } },
        { new: true }
    );
};

const patchBitacoraDocumento = async (docId, bitacoraData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { bitacora: bitacoraData } },
        { new: true }
    );
};

const patchCopiaDocumento = async (docId, copiaData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { copia: copiaData } },
        { new: true }
    );
};

const patchAnexoDocumento = async (docId, anexoData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { anexo: anexoData } },
        { new: true }
    );
};

const patchRemoverAnexoDocumento = async (docId, anexoId) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { anexo: { anexoId } } },
        { new: true }
    );
};

const patchStatusDocumento = async (docId, statusData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $set: { status: statusData.status } },
        { new: true }
    );
};

const patchRelacionadoDocumento = async (docId, relacionadoData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { relacionado: relacionadoData } },
        { new: true }
    );
};

const patchRemoverRelacionadoDocumento = async (docId, relacionadoId) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { relacionado: { relacionadoId } } },
        { new: true }
    );
};

const deleteDocumento = async (docId) => {
    return await documentoModel.findOneAndDelete({ docId });
};

export default {
    getAll,
    getById,
    create,
    putDocumento,
    patchTurnadoDocumento,
    patchBitacoraDocumento,
    patchCopiaDocumento,
    patchAnexoDocumento,
    patchRemoverAnexoDocumento,
    patchStatusDocumento,
    patchRelacionadoDocumento,
    patchRemoverRelacionadoDocumento,
    deleteDocumento
};