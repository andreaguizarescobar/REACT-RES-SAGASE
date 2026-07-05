import oficioService from '../services/oficio.service.js';

export const getOficioList = async (req, res, next) => {
  try {
    const oficios = await oficioService.getAll();
    res.status(200).json(oficios);
  } catch (error) {
    next(error);
  }
};

export const getOficioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oficio = await oficioService.getById(id);
    if (!oficio) {
      return res.status(404).json({ message: 'Oficio no encontrado' });
    }
    res.status(200).json(oficio);
  } catch (error) {
    next(error);
  }
};

export const postOficioItem = async (req, res, next) => {
  try {
    const oficioData = typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const oficio = await oficioService.createOficio(oficioData, req.user);
    res.status(201).json(oficio);
  } catch (error) {
    next(error);
  }
};

export const putOficioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oficio = await oficioService.updateOficio(id, req.body);
    res.status(200).json(oficio);
  } catch (error) {
    next(error);
  }
};

export const patchOficioTurnado = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado todavía' });
  } catch (error) {
    next(error);
  }
};

export const patchOficioCopia = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado todavía' });
  } catch (error) {
    next(error);
  }
};

export const patchOficioBitacora = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado todavía' });
  } catch (error) {
    next(error);
  }
};

export const patchOficioStatus = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado todavía' });
  } catch (error) {
    next(error);
  }
};

export const patchOficioRelacionados = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado todavía' });
  } catch (error) {
    next(error);
  }
};

export const deleteOficioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oficio = await oficioService.deleteOficio(id);
    res.status(200).json(oficio);
  } catch (error) {
    next(error);
  }
};

export default {
  getOficioList,
  getOficioItem,
  postOficioItem,
  putOficioItem,
  patchOficioTurnado,
  patchOficioCopia,
  patchOficioBitacora,
  patchOficioStatus,
  patchOficioRelacionados,
  deleteOficioItem,
};