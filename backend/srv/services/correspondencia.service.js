import model from '../models/correspondencia.model.js';
import Contador from '../models/contador.model.js';

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
    const anio = Number(correspondenciaData?.anio || new Date().getFullYear());
    const nombreContador = `salida:correspondencia:${anio}`;
    const folioProporcionado = correspondenciaData?.folio;

    let valorAnterior = 0;
    let valorFinal = 1;

    if (folioProporcionado) {
        const match = String(folioProporcionado).match(/^SC\/(\d{4})\/(\d{4})$/i);
        if (match) {
            const valorFolio = Number(match[1]);
            const contadorActual = await Contador.findOne({ nombre: nombreContador }).lean();
            valorAnterior = contadorActual?.valor || 0;
            valorFinal = Math.max(valorAnterior + 1, valorFolio);
        }
    } else {
        const contadorActual = await Contador.findOne({ nombre: nombreContador }).lean();
        valorAnterior = contadorActual?.valor || 0;
        valorFinal = valorAnterior + 1;
    }

    const folioFinal = folioProporcionado || `SC/${String(valorFinal).padStart(4, "0")}/${anio}`;

    try {
        await Contador.findOneAndUpdate(
            { nombre: nombreContador },
            { $set: { valor: valorFinal } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const newCorrespondencia = new model({ ...correspondenciaData, folio: folioFinal });
        return await newCorrespondencia.save();
    } catch (error) {
        if (valorFinal !== valorAnterior) {
            await Contador.findOneAndUpdate(
                { nombre: nombreContador },
                { $set: { valor: valorAnterior } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }
        throw error;
    }
};

const putCorrespondenciaItem = async (id, correspondenciaData) => {
    return await model.findByIdAndUpdate(id, correspondenciaData, { new: true });
};

const deleteCorrespondenciaItem = async (id) => {
    return await model.findByIdAndDelete(id);
};

export default { getCorrespondenciaList, getCorrespondenciaItem, postCorrespondenciaItem, putCorrespondenciaItem, deleteCorrespondenciaItem };