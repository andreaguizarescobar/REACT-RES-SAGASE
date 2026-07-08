import model from "../models/fondo.model.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFondos = async () => await model.find({});
export const getFondo = async (id) => await model.findById(id);
export const createFondo = async (fondo) => await model.create(fondo);
export const updateFondo = async (id, fondo) => {
    const res = await model.findOneAndUpdate({ _id: id }, fondo, { new: true })
    return res;
};
export const deleteFondo = async (id) => await model.findByIdAndDelete(id);

export default { getFondos, getFondo, createFondo, updateFondo, deleteFondo };