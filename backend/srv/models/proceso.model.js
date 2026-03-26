import { Schema, model } from 'mongoose';

const ProcesoSchema = new Schema({
    processId: { type: String, required: true, unique: true },
  nombre: String
}, { timestamps: true });

export default model('Proceso', ProcesoSchema);