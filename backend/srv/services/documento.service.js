import documentoModel from '../models/documento.model.js';
import eliminadoModel from '../models/eliminados.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getAll = async () => {
    return await documentoModel.find().populate('remitente')
    .populate({ path: 'registrador', select: 'area' })
    .populate('turnados.dirigido', 'area')
    .populate('validador', 'area');
};

const getById = async (docId) => {
    const query = mongoose.Types.ObjectId.isValid(docId)
        ? { $or: [{ docId }, { _id: docId }] }
        : { docId };

    const documento = await documentoModel.findOne(query)
        .populate('remitente')
        .populate('tipo')
        .populate('tema')
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
        })
        .populate('bitacora.user', 'nombre')
        .populate('respuestas.registrador', 'nombre')
        .populate('adicional.adicionales.registrador', 'nombre');

    return documento;
};

import { obtenerSiguienteNumero } from './contador.service.js';
import userModel from '../models/user.model.js';
const create = async (documentoData, user) => {
    // Verificar si ya existe un documento con el mismo docId
    const existingDocumento = await documentoModel.findOne({ docId: documentoData.docId });
    if (existingDocumento) {
        throw new Error('Ya existe un documento con este número');
    }
        // Generar un nuevo folio si ya existe
        const numero = await obtenerSiguienteNumero("documento");
        // dar formato de 4 digitos al numero
        if (numero < 10) {
            documentoData.folio = `000${numero}-${new Date().getFullYear()}`;
        } else if (numero < 100) {
            documentoData.folio = `00${numero}-${new Date().getFullYear()}`;
        } else if (numero < 1000) {
            documentoData.folio = `0${numero}-${new Date().getFullYear()}`;
        }else {
            documentoData.folio = `${numero}-${new Date().getFullYear()}`;
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
            descripcion: 'Registro del documento: ' + documentoData.folio,
            user: user.id,
            fecha: new Date(),
            importancia: 'Alta',
        }
    ];
    documentoData.registrador = user.id;
    const newDocumento = new documentoModel(documentoData);
    const doc = await newDocumento.save();
    const pendiente = await userModel.findOneAndUpdate({ _id: user.id },
        {$push: {tareas: {
            tarea: 'No turnado',
            fecha: new Date(),
            descripcion: 'Falta turnar el documento',
            documento: doc._id,
            status: 'pendiente'
        }}},
        {new: true} 
    );
    return doc.populate('anexos.registrador', 'nombre');
};
const putDocumento = async (docId, documentoData, user) => {
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

    return await documentoModel.findOneAndUpdate(
        { docId },
        { $set: documentoData,
          $push: { bitacora: {
            descripcion: 'Actualización de datos del documento',
            user: user.id,
            fecha: new Date(),
            importancia: 'Media',
        }} },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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

import areaModel from '../models/area.model.js';
import instruccionModel from '../models/instruccion.model.js';
const patchTurnadoDocumento = async (docId, turnadoData, user) => {
    const session = await mongoose.startSession();
    try{
    session.startTransaction();
    const area = await areaModel.findById(turnadoData.areaDestino);
    const instruccion = await instruccionModel.findById(turnadoData.instruccion); // Manejar ambos casos
    const numero = await obtenerSiguienteNumero("turnado");
    turnadoData.numero = numero.toString().padStart(6, "0");
    const doc = await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { turnados: turnadoData,  bitacora: {
            descripcion: `Turnado al área ${area.nombre} con instrucción: ${instruccion.descripcion}`,
            user: user.id,
            fecha: new Date(),
            importancia: 'Media',
        }},
         $set: { status: "Autorizado y turnado" } },
        { new: true, session }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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
    })
    .populate('bitacora.user', 'nombre');

    // mover la tarea pendeiente a salidas, cambiando el estatus a salida, y agregar una nueva tarea pendiente para el area destino
    const pendientes = await userModel.updateOne(
    { _id: user.id },
    { $set: { 'tareas.$[t].status': 'salida', 'tareas.$[t].fecha': new Date, 'tareas.$[t].tarea': 'Turnado' } },
    {
        session,
        arrayFilters: [{ 't.documento': doc._id, 't.status': 'pendiente' }]
    }
    );

    await userModel.findOneAndUpdate(
        { _id: turnadoData.dirigido},
        {$push: { tareas: {
            tarea: 'Atiende asunto',
            fecha: new Date(),
            descripcion: 'Atender asunto',
            documento: doc._id,
            status: 'entrada'
        }}},
        { session }
    )

    await session.commitTransaction();
    session.endSession();

    return doc
    }catch(e){
        await session.abortTransaction();
        session.endSession();

        throw e;
    }
};

const patchBitacoraDocumento = async (docId, bitacoraData) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { bitacora: bitacoraData } },
        { new: true }
    );
};

const patchCopiaDocumento = async (docId, copiaData) => {
    const funcionario = await userModel.findById(copiaData.funcionario);
    console.log("Funcionario encontrado para agregar copia:", docId);
    const documento = await documentoModel.findOne({ docId });
    console.log("Documento encontrado para agregar copia:", documento);
    funcionario.copias.push(documento._id);
    console.log("Guardando funcionario con copia agregada:", funcionario);
    funcionario.notificaciones.push({ 
        tarea: 'Copia de documento',
        descripcion: `Agregada copia del documento ${docId}`,
        fecha: new Date(),
        status: 'Sin leer',
        documento: documento._id,
     });
     console.log("Guardando funcionario con copia agregada:", funcionario);
     await funcionario.save();

    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { copias: copiaData, bitacora: {
            descripcion: `Agregada copia para ${funcionario.nombre}`,
            user: copiaData.funcionario,
            fecha: new Date(),
            importancia: 'Baja',
        }} },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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
    })
    .populate('bitacora.user', 'nombre');
};

const patchAnexoDocumento = async (docId, anexoData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { anexos: anexoData, bitacora: {
            descripcion: `Se adjunto al documento: ${anexoData.nombre}`,
            user: user.id,
            fecha: new Date(),
            importancia: 'Media',
        }} },
        { returnDocument: 'after' }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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
    })
    .populate('bitacora.user', 'nombre');
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
    // Agregar entrada a la bitácora
    documento.bitacora.push({
        descripcion: `Removido anexo: ${anexo.nombre}`,
        user: user.id,
        fecha: new Date(),
        importancia: 'Media',
    });
    await documento.save();

    // Intentar eliminar el archivo físico
    if (rutaArchivo) {
        try {
            // Construir la ruta completa desde el directorio del servicio
            let rutaCompleta = rutaArchivo;
            if (!path.isAbsolute(rutaArchivo)) {
                rutaCompleta = path.join(__dirname, rutaArchivo);
            }

            // Verificar si el archivo existe antes de intentar eliminarlo
            if (fs.existsSync(rutaCompleta)) {
                fs.unlinkSync(rutaCompleta);
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
        })
        .populate('bitacora.user', 'nombre');
};

const patchStatusDocumento = async (docId, statusData, user) => {
    const bitacoraEntry = {
        descripcion: `Cambio de estatus a: ${statusData.status}`,
        user: user.id,
        fecha: new Date(),
        importancia: 'Media',
    };
    if (statusData.status === "Autorizado, y turnado") {
        bitacoraEntry.descripcion += `, turnado a: ${statusData.areaDestino.nombre}`;
    } else if (statusData.status === "Validado") {
        bitacoraEntry.descripcion += `, validado por: ${user.nombre}`;
        bitacoraEntry.importancia = 'Alta';
    }
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $set: { status: statusData.status },
         $push: { bitacora: bitacoraEntry } },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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
    })
    .populate('bitacora.user', 'nombre');
};

const patchRelacionadoDocumento = async (docId, relacionadoData, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $push: { relacionados: relacionadoData.relacionado, bitacora: {
            descripcion: `Agregado relacionado: ${relacionadoData.relacionado.item.folio}`,
            user: user.id,
            fecha: new Date(),
            importancia: 'Media',
        }} },
        { new: true }
    )
    .populate('remitente')
    .populate('tipo')
    .populate('tema')
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
    })
    .populate('bitacora.user', 'nombre');
};

const patchRemoverRelacionadoDocumento = async (docId, relacionadoId, user) => {
    return await documentoModel.findOneAndUpdate(
        { docId },
        { $pull: { relacionados: { item: relacionadoId.relacionadoId } },
         $push: { bitacora: {
            descripcion: `Removido relacionado con ID: ${relacionadoId.relacionadoId.folio || relacionadoId.relacionadoId}`,
            user: user.id,
            fecha: new Date(),
            importancia: 'Media',
        }} },
        { new: true }
    ).populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({ path: 'anexos', populate: { path: 'registrador', select: 'nombre' } })
    .populate('bitacora.user', 'nombre');

};

const deleteDocumento = async (docId, user, motivo) => {
    const documento = await documentoModel.findOne({ docId });
    if (!documento) {
        throw new Error('Documento no encontrado');
    }

    // Validar que el documento no tenga estatus "Validado"
    if (documento.status === "Validado") {
        throw new Error('No se puede eliminar un documento con estatus Validado');
    }

    // Guardar registro en eliminados
    const eliminadoData = {
        docId: documento.docId,
        folio: documento.folio,
        motivoEliminacion: motivo,
        usuario: user.id,
        fechaEliminacion: new Date(),
    };
    await eliminadoModel.create(eliminadoData);

    // Eliminar archivos físicos de anexos
    if (documento.anexos && documento.anexos.length > 0) {
        for (const anexo of documento.anexos) {
            if (anexo.ruta) {
                try {
                    let rutaCompleta = anexo.ruta;
                    if (!path.isAbsolute(anexo.ruta)) {
                        rutaCompleta = path.join(__dirname, anexo.ruta);
                    }
                    if (fs.existsSync(rutaCompleta)) {
                        fs.unlinkSync(rutaCompleta);
                    }
                } catch (error) {
                    console.error(`Error al eliminar archivo de anexo: ${error.message}`);
                }
            }
        }
    }

    // Eliminar archivos físicos de respuestas
    if (documento.respuestas && documento.respuestas.length > 0) {
        for (const respuesta of documento.respuestas) {
            if (respuesta.ruta) {
                try {
                    let rutaCompleta = respuesta.ruta;
                    if (!path.isAbsolute(respuesta.ruta)) {
                        rutaCompleta = path.join(__dirname, respuesta.ruta);
                    }
                    if (fs.existsSync(rutaCompleta)) {
                        fs.unlinkSync(rutaCompleta);
                    }
                } catch (error) {
                    console.error(`Error al eliminar archivo de respuesta: ${error.message}`);
                }
            }
        }
    }

    // Eliminar tareas, notificaciones y copias de todos los usuarios relacionadas con este documento
    const docObjectId = documento._id;
    await userModel.updateMany(
      {},
      { 
        $pull: { 
          tareas: { documento: docObjectId }, 
          notificaciones: { documento: docObjectId },
          copias: docObjectId
        } 
      }
    );

    // Eliminar el documento de la colección
    await documentoModel.findOneAndDelete({ docId });

    return { message: 'Documento eliminado correctamente', folio: documento.folio };
};

const reporteAcuerdos = async (fechaInicio, fechaFin) => {
    const filtroFecha = {};
  if (fechaInicio) {
    filtroFecha.$gte = new Date(fechaInicio);
  }

  if (fechaFin) {
    filtroFecha.$lte = new Date(fechaFin);
  }

   const query = Object.keys(filtroFecha).length > 0 ? {turnados: { $elemMatch: { fechaTurnado: filtroFecha  } }}
   : {}; 

    return await documentoModel.find(query)
    .populate('remitente')
    .populate('tipo')
    .populate('turnados.instruccion');
}

const reporteAsuntos = async (filtro) => {
    const filtroAsuntos = {}
    const status = [];
    if(filtro.autorizadoYTurnado) {
        status.push("Autorizado y turnado");
    }
    if (filtro.Recibido){
        status.push("Recibido, en ejecución");
    }
    if (filtro.Validado){
        status.push("Validado");
    }
    if (filtro.Concluido){
        status.push("Con respuesta registrada");
    }
    if (filtro.Cerrado){
        status.push("Cerrado");
    }
    if (filtro.fechaInicio) {
        filtroAsuntos.$gte = new Date(filtro.fechaInicio);
      }
    
      if (filtro.fechaFin) {
        filtroAsuntos.$lte = new Date(filtro.fechaFin);
      }

    // buscar todos los documentos con los status marcados
    const query = Object.keys(filtroAsuntos).length > 0 ? {status: { $in: status }, turnados: {$elemMatch: {fechaTurnado: filtroAsuntos} }}
    : ((status.length > 0) ? {status: { $in: status }} : {});

    return await documentoModel.find(query)
    .populate('remitente')
    .populate('tipo')
    .populate('turnados.instruccion');
}

const patchRespuestaDocumento = async (docId, respuestaData, user, ruta) => {
    const query = mongoose.Types.ObjectId.isValid(docId)
        ? { $or: [{ docId }, { _id: docId }] }
        : { docId };

    return await documentoModel.findOneAndUpdate(
         query,
        { $push: { respuestas: {
            mensaje: respuestaData.mensaje,
            nombre: respuestaData.nombre,
            fecha: new Date(),
            ruta: ruta,
            registrador: user.id,
        }} },
        { new: true }
    ).populate('remitente')
    .populate('tipo')
    .populate('tema')
    .populate('adicional')
    .populate({ path: 'relacionados.item', populate: { path: 'remitente', select: 'name' } })
    .populate('turnados.instruccion')
    .populate('turnados.remitente')
    .populate('turnados.areaDestino')
    .populate('turnados.dirigido')
    .populate('turnados.turna')
    .populate('copias.funcionario')
    .populate({ path: 'anexos', populate: { path: 'registrador', select: 'nombre' } })
    .populate('bitacora.user', 'nombre')
    .populate('respuestas.registrador', 'nombre');
};

const patchAgregarAdicionalDocumento = async (docId, adicionalData, user) => {
    const documento = await documentoModel.findOne({ docId });
    if (!documento) {
        throw new Error('Documento no encontrado');
    }

    // Asegurar que el documento tiene la estructura de adicional
    if (!documento.adicional) {
        documento.adicional = { tiene: true, adicionales: [] };
    }

    // Crear nuevo material adicional
    const nuevoAdicional = {
        tipo: adicionalData.tipo,
        descripcion: adicionalData.descripcion,
        registrador: user.id,
    };

    // Agregar a la lista de adicionales
    documento.adicional.adicionales.push(nuevoAdicional);
    documento.adicional.tiene = true;

    // Agregar a bitácora
    documento.bitacora.push({
        descripcion: `Agregado material adicional: ${adicionalData.tipo}`,
        user: user.id,
        fecha: new Date(),
        importancia: 'Media',
    });

    await documento.save();
    return await getById(docId);
};

const patchEliminarAdicionalDocumento = async (docId, adicionalId, user) => {
    const documento = await documentoModel.findOne({ docId });
    if (!documento) {
        throw new Error('Documento no encontrado');
    }

    if (!documento.adicional || !documento.adicional.adicionales) {
        throw new Error('El documento no tiene materiales adicionales');
    }

    // Encontrar el material a eliminar
    const adicional = documento.adicional.adicionales.id(adicionalId);
    if (!adicional) {
        throw new Error('Material adicional no encontrado');
    }

    // Guardar el tipo para la bitácora
    const tipoAdicional = adicional.tipo;

    // Eliminar el material
    documento.adicional.adicionales.pull({ _id: adicionalId });

    // Agregar a bitácora
    documento.bitacora.push({
        descripcion: `Removido material adicional: ${tipoAdicional}`,
        user: user.id,
        fecha: new Date(),
        importancia: 'Media',
    });

    await documento.save();
    return await getById(docId);
};

const getEliminados = async () => {
    return await eliminadoModel.find()
        .populate('usuario', 'nombre')
        .sort({ fechaEliminacion: -1 });
};

const searchDocumentos = async (query) => {
    const searchQuery = {
        eliminado: false,
        $or: [
            { folio: { $regex: query, $options: 'i' } },
            { docId: { $regex: query, $options: 'i' } },
            { asunto: { $regex: query, $options: 'i' } }
        ]
    };

    return await documentoModel.find(searchQuery)
        .populate('remitente', 'name')
        .populate('tipo', 'nombre')
        .select('folio docId asunto fechaDoc remitente tipo status')
        .limit(20);
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
    patchAgregarAdicionalDocumento,
    patchEliminarAdicionalDocumento,
    deleteDocumento,
    reporteAcuerdos,
    reporteAsuntos,
    patchRespuestaDocumento,
    searchDocumentos,
    getEliminados
};