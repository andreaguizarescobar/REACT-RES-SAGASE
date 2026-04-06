import documentoModel from '../models/documento.model.js';

const getAll = async () => {
    return await documentoModel.find().populate('remitente');
};

const getById = async (docId) => {
    return await documentoModel.findOne({ docId });
};

const create = async (documentoData) => {
    // Verificar si ya existe un documento con el mismo docId
    const existingDocumento = await documentoModel.findOne({ docId: documentoData.docId });
    if (existingDocumento) {
        throw new Error('Ya existe un documento con este número');
    }

    // Verificar si ya existe un documento con el mismo folio
    let existingFolio = await documentoModel.findOne({ folio: documentoData.folio });
    if (existingFolio) {
        // Generar un nuevo folio si ya existe
        documentoData.folio = `Folio ${Math.floor(Math.random() * 9000) + 1000}-${new Date().getFullYear()}-${Date.now()}`;
    }

    // Asegurar que las fechas sean objetos Date válidos
    if (documentoData.fechaDoc) {
        documentoData.fechaDoc = new Date(documentoData.fechaDoc);
    }
    if (documentoData.acuse) {
        documentoData.acuse = new Date(documentoData.acuse);
    }
    if (documentoData.registro) {
        documentoData.registro = new Date(documentoData.registro);
    }

    const newDocumento = new documentoModel(documentoData);
    return await newDocumento.save();
};
const putDocumento = async (docId, documentoData) => {
    return await documentoModel.findOneAndUpdate({ docId }, documentoData, { new: true });
};

const patchTurnadoDocumento = async (docId, turnadoData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { turnados: turnadoData } },
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
        { $push: { copias: copiaData } },
        { new: true }
    );
};

const patchAnexoDocumento = async (docId, anexoData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { anexos: anexoData } },
        { new: true }
    );
};

const patchRemoverAnexoDocumento = async (docId, anexoId) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { anexos: { anexoId } } },
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
        { $push: { relacionados: relacionadoData.relacionado } },
        { new: true }
    );
};

const patchRemoverRelacionadoDocumento = async (docId, relacionadoId) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { relacionados: { relacionadoId } } },
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