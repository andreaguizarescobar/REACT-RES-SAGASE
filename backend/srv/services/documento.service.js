import documentoModel from '../models/documento.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getAll = async () => {
    return await documentoModel.find().populate('remitente');
};

const getById = async (docId) => {
    return await documentoModel.findOne({ docId })
        .populate('remitente')
        .populate('tipo')
        .populate('tema')
        .populate('secundario')
        .populate('adicional')
        .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
        .populate('turnados.instruccion')
        .populate('turnados.remitente')
        .populate('turnados.areaDestino')
        .populate('turnados.dirigido')
        .populate('turnados.turna')
        .populate('copias.funcionario')
        .populate({
            path: 'anexos',
            populate: {
                path: 'registrador', select: 'nombre'
            }
        });
};

const create = async (documentoData, user) => {
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

    documentoData.bitacora = [
        {
            descripcion: 'Registro del documento',
            user: user,
            fecha: new Date(),
        }
    ];
    const newDocumento = new documentoModel(documentoData);
    return await newDocumento.save();
};
const putDocumento = async (docId, documentoData, user) => {
    return await documentoModel.findOneAndUpdate({ docId }, { $set: documentoData }, { new: true });
};

const patchTurnadoDocumento = async (docId, turnadoData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { turnados: turnadoData } },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({
        path: 'anexos',
        populate: {
            path: 'registrador', select: 'nombre'
        }
    });
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
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({
        path: 'anexos',
        populate: {
            path: 'registrador', select: 'nombre'
        }
    });
};

const patchAnexoDocumento = async (docId, anexoData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { anexos: anexoData } },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({
        path: 'anexos',
        populate: {
            path: 'registrador', select: 'nombre'
        }
    });
};

const patchRemoverAnexoDocumento = async (docId, anexoId, user) => {
    // Primero, buscar el documento y obtener el anexo específico
    const documento = await documentoModel.findOne({ docId });
    if (!documento) {
        throw new Error('Documento no encontrado');
    }

    // Encontrar el anexo específico
    const anexo = documento.anexos.id(anexoId.anexoId);
    if (!anexo) {
        throw new Error('Anexo no encontrado');
    }

    // Guardar la ruta del archivo antes de eliminar la referencia
    const rutaArchivo = anexo.ruta;

    // Eliminar la referencia del anexo de la base de datos
    documento.anexos.pull({ _id: anexoId.anexoId });
    await documento.save();

    // Intentar eliminar el archivo físico
    if (rutaArchivo) {
        try {
            // Construir la ruta completa desde el directorio del servicio
            let rutaCompleta = rutaArchivo;
            if (!path.isAbsolute(rutaArchivo)) {
                // La ruta guardada es relativa como '../uploads/anexos/filename'
                rutaCompleta = path.join(__dirname, rutaArchivo);
            }

            // Verificar si el archivo existe antes de intentar eliminarlo
            if (fs.existsSync(rutaCompleta)) {
                fs.unlinkSync(rutaCompleta);
                console.log(`Archivo eliminado: ${rutaCompleta}`);
            } else {
                console.warn(`Archivo no encontrado para eliminar: ${rutaCompleta}`);
            }
        } catch (error) {
            console.error(`Error al eliminar archivo físico: ${error.message}`);
            // No lanzamos error aquí porque la referencia ya fue eliminada de la BD
            // Solo logueamos el error para debugging
        }
    }

    // Devolver el documento actualizado con populate
    return await documentoModel.findOne({ docId })
        .populate('remitente')
        .populate('tipo')
        .populate('tema')
        .populate('secundario')
        .populate('adicional')
        .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
        .populate('turnados.instruccion')
        .populate('turnados.remitente')
        .populate('turnados.areaDestino')
        .populate('turnados.dirigido')
        .populate('turnados.turna')
        .populate('copias.funcionario')
        .populate({
            path: 'anexos',
            populate: {
                path: 'registrador', select: 'nombre'
            }
        });
};

const patchStatusDocumento = async (docId, statusData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $set: { status: statusData.status } },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({
        path: 'anexos',
        populate: {
            path: 'registrador', select: 'nombre'
        }
    });
};

const patchRelacionadoDocumento = async (docId, relacionadoData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { relacionados: relacionadoData.relacionado } },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({
        path: 'anexos',
        populate: {
            path: 'registrador', select: 'nombre'
        }
    });
};

const patchRemoverRelacionadoDocumento = async (docId, relacionadoId, user) => {
    console.log("Eliminando relacionado con ID:", relacionadoId);
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { relacionados: { item: relacionadoId.relacionadoId } } },
        { new: true }
    ).populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('secundario')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({ path: 'anexos', populate: { path: 'registrador', select: 'nombre' } });

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