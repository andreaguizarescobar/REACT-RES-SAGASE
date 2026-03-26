import rolService from "../services/rol.service.js";

export const getAll = async (req, res) => {
    try {
        const data = await rolService.getAllRoles();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req, res) => {
    const { roleId } = req.params;
    try {
        const data = await rolService.getRoleById(roleId);
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ error: `Rol con id: ${roleId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRol = async (req, res) => {
    const roleData = req.body;
    try {
        const newRole = await rolService.createRole(roleData);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRol = async (req, res) => {
    const { roleId } = req.params;
    const roleData = req.body;
    try {
        const updatedRole = await rolService.updateRole(roleId, roleData);
        if (updatedRole) {
            res.json(updatedRole);
        } else {
            res.status(404).json({ error: `Rol con id: ${roleId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRol = async (req, res) => {
    const { roleId } = req.params;
    try {
        const deletedRole = await rolService.deleteRole(roleId);
        if (deletedRole) {
            res.json({ message: `Rol con id: ${roleId} eliminado` });
        } else {
            res.status(404).json({ error: `Rol con id: ${roleId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addProcessToRol = async (req, res) => {
    const { roleId } = req.params;
    const { processId } = req.body;
    try {        const updatedRole = await rolService.addProcessToRol(roleId, processId);
        if (updatedRole) {
            res.json(updatedRole);
        } else {
            res.status(404).json({ error: `Rol con id: ${roleId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const removeProcessFromRol = async (req, res) => {
    const { roleId } = req.params;
    const { processId } = req.body;
    try {        const updatedRole = await rolService.removeProcessFromRol(roleId, processId);
        if (updatedRole) {
            res.json(updatedRole);
        } else {
            res.status(404).json({ error: `Rol con id: ${roleId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAll,
    getById,
    createRol,
    updateRol,
    deleteRol,
    addProcessToRol,
    removeProcessFromRol
};