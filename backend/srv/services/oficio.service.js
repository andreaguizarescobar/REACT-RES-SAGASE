import OficioModel from '../models/oficio.model.js';

const getAll = async () => {
  return await OficioModel.find()
    .populate('plantillaId')
    .populate('remitenteId')
    .populate('destinatarioId')
    .populate('creadoPor')
    .sort({ createdAt: -1 });
};

const getById = async (id) => {
  return await OficioModel.findById(id)
    .populate('plantillaId')
    .populate('remitenteId')
    .populate('destinatarioId')
    .populate('creadoPor');
};

const createOficio = async (oficioData, user) => {
  const payload = { ...oficioData };

  if (!payload.folio && payload.numero) {
    payload.folio = payload.numero;
  }

  if (!payload.numero && payload.folio) {
    payload.numero = payload.folio;
  }

  if (!payload.status) {
    payload.status = 'generado';
  }

  if (payload.fecha && !(payload.fecha instanceof Date)) {
    payload.fecha = new Date(payload.fecha);
  }

  if (user?.id) {
    payload.creadoPor = user.id;
  }

  const oficio = new OficioModel(payload);
  return await oficio.save();
};

const updateOficio = async (id, data) => {
  return await OficioModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteOficio = async (id) => {
  return await OficioModel.findByIdAndDelete(id);
};

export default {
  getAll,
  getById,
  createOficio,
  updateOficio,
  deleteOficio,
};