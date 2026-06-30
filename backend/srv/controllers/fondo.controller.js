import service from "../services/fondo.service.js";

export const getFondoList = async (req, res, next) => {
    try {
        const fondos = await service.getFondos();
        res.status(200).json(fondos);
    } catch (error) {
        next(error);
    }
};

export const getFondoById = async (req, res, next) => {
    const { fondoId } = req.params;
    try {
        const fondo = await service.getFondo(fondoId);
        res.status(200).json(fondo);
    } catch (error) {
        next(error);
    }
};

export const postFondoItem = async (req, res, next) => {
    try {
        const data = {};
        
        // Handle both FormData and JSON body
        if (req.body.data) {
            // Legacy: JSON string in req.body.data
            Object.assign(data, JSON.parse(req.body.data));
        } else {
            // New: FormData with fields directly in req.body
            Object.assign(data, req.body);
        }
        
        // Handle file uploads
        if (req.files) {
            if (req.files.encabezado?.[0]?.filename) {
                data.encabezado = `../uploads/fondo/${req.files.encabezado[0].filename}`;
            }
            if (req.files.pie?.[0]?.filename) {
                data.pie = `../uploads/fondo/${req.files.pie[0].filename}`;
            }
            if (req.files.fondo?.[0]?.filename) {
                data.fondo = `../uploads/fondo/${req.files.fondo[0].filename}`;
            }
        }
        
        const fondo = await service.createFondo(data);
        res.status(201).json(fondo);
    } catch (error) {
        next(error);
    }
};

export const putFondoItem = async (req, res, next) => {
    const { fondoId } = req.params;
    try {
        const data = { ...req.body };
        if (req.files) {
            if (req.files.encabezado?.[0]?.filename) {
                data.encabezado = `../uploads/fondo/${req.files.encabezado[0].filename}`;
            }
            if (req.files.pie?.[0]?.filename) {
                data.pie = `../uploads/fondo/${req.files.pie[0].filename}`;
            }
            if (req.files.fondo?.[0]?.filename) {
                data.fondo = `../uploads/fondo/${req.files.fondo[0].filename}`;
            }
        }
        const fondo = await service.updateFondo(fondoId, data);
        res.status(200).json(fondo);
    } catch (error) {
        next(error);
    }
};

export const deleteFondoItem = async (req, res, next) => {
    const { fondoId } = req.params;
    try {
        const fondo = await service.deleteFondo(fondoId);
        res.status(200).json(fondo);
    } catch (error) {
        next(error);
    }
};

export default { getFondoList, getFondoById, postFondoItem, putFondoItem, deleteFondoItem };