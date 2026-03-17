import { Schema, model } from 'mongoose';

const ProcesoSchema = new Schema({
  nombre: String
}, { timestamps: true });

export default model('Proceso', ProcesoSchema);