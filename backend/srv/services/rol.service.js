import roles from "../models/rol.model.js";
import Proceso from "../models/proceso.model.js";

export const getAllRoles = async () => {
    return await roles.find();
};

export const getRoleById = async (roleId) => {
    return await roles.findOne({ roleId });
};

export const createRole = async (roleData) => {
    const roleExists = await roles.findOne({ roleId: roleData.roleId });
    if (roleExists) {
        throw new Error(`El rol con id: ${roleData.roleId} ya existe`);
    }
    const newRole = await roles.create(roleData);
    return newRole;
};

export const updateRole = async (roleId, roleData) => {
    return await roles.findOneAndUpdate({ roleId }, roleData, { new: true });
};

export const deleteRole = async (roleId) => {
    return await roles.findOneAndDelete({ roleId });
};

export const addProcessToRol = async (roleId, processId) => {
   /* const proceso = await Proceso.findOne({ processId: req.body.processId });

    if (!proceso) {
    return res.status(404).json({ message: "Proceso no existe" });
    }*/

    const role = await roles.findOneAndUpdate({ roleId }, { $addToSet: { procesos: processId } }, { new: true });
    if (!role) {
        throw new Error(`Rol con id: ${roleId} no encontrado`);
    }
    return role;
};

export const removeProcessFromRol = async (roleId, processId) => {
    const role = await roles.findOneAndUpdate({ roleId }, { $pull: { procesos: processId } }, { new: true });
    if (!role) {
        throw new Error(`Rol con id: ${roleId} no encontrado`);
    }
    return role;
};

export default {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    addProcessToRol,
    removeProcessFromRol
};