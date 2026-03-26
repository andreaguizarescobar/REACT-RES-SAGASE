import servicioTemaPrincipal from "../services/temaPrincipal.service.js";

export const getAll = async (req, res) => {
    try {
        const temasPrincipales = await servicioTemaPrincipal.getAll();
        res.json(temasPrincipales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemaPrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const temaPrincipal = await servicioTemaPrincipal.getTemaPrincipal(id);
        if (!temaPrincipal) {
            return res.status(404).json({ error: "Tema principal no encontrado" });
        }
        res.json(temaPrincipal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postTemaPrincipal = async (req, res) => {
    try {
        const data = req.body;
        const newTemaPrincipal = await servicioTemaPrincipal.postTemaPrincipal(data);
        res.status(201).json(newTemaPrincipal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const putTemaPrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedTemaPrincipal = await servicioTemaPrincipal.putTemaPrincipal(id, data);
        if (!updatedTemaPrincipal) {
            return res.status(404).json({ error: "Tema principal no encontrado" });
        }
        res.json(updatedTemaPrincipal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemaPrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTemaPrincipal = await servicioTemaPrincipal.deleteTemaPrincipal(id);
        if (deletedTemaPrincipal.deletedCount === 0 ) {
            return res.status(404).json({ error: "Tema principal no encontrado" });
        }
        res.json({ message: "Tema principal eliminado" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};