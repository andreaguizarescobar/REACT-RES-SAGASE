import { Schema, model } from "mongoose";

const InstruccionSchema = new Schema({
    descripcion: { type: String, required: true },
    activo: { type: Boolean, default: true },
});

export default model('Instruccion', InstruccionSchema);