import { Schema, model } from "mongoose";

const InstruccionSchema = new Schema({
    descripcion: { type: String, required: true },
});

export default model('Instruccion', InstruccionSchema);