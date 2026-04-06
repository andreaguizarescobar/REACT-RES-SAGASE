import seccionService from '../services/seccion.service.js';

export const getAll = async (req, res) => {
    try {
        const secciones = await seccionService.getAll();
        res.status(200).json(secciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const seccion = await seccionService.getById(req.params.seccionId);
        if (!seccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        res.status(200).json(seccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSeccion = async (req, res) => {
    try {
        const newSeccion = await seccionService.createSeccion(req.body);
        res.status(201).json(newSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSeccion = async (req, res) => {
    try {
        const updatedSeccion = await seccionService.updateSeccion(req.params.seccionId, req.body);
        if (!updatedSeccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        res.status(200).json(updatedSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSeccion = async (req, res) => {
    try {
        const deletedSeccion = await seccionService.deleteSeccion(req.params.seccionId);
        if (!deletedSeccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        res.status(200).json({ message: 'Sección eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addSerieToSeccion = async (req, res) => {
    try {
        const updatedSeccion = await seccionService.addSerieToSeccion(req.params.seccionId, req.body);
        if (!updatedSeccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        res.status(200).json(updatedSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeSerieFromSeccion = async (req, res) => {
    try {
        const updatedSeccion = await seccionService.removeSerieFromSeccion(req.params.seccionId, req.body.serieId);
        if (!updatedSeccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        res.status(200).json(updatedSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addSubserieToSerie = async (req, res) => {
    try {
        const updatedSeccion = await seccionService.addSubserieToSerie(req.params.seccionId, req.params.serieId, req.body);
        if (!updatedSeccion) {
            return res.status(404).json({ message: 'Sección o Serie no encontrada' });
        }
        res.status(200).json(updatedSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeSubserieFromSerie = async (req, res) => {
    try {
        const updatedSeccion = await seccionService.removeSubserieFromSerie(req.params.seccionId, req.params.serieId, req.body.subserieId);
        if (!updatedSeccion) {
            return res.status(404).json({ message: 'Sección o Serie no encontrada' });
        }
        res.status(200).json(updatedSeccion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
