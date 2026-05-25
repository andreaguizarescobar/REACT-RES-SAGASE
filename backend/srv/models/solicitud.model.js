import { Schema, model } from "mongoose";

const SolicitudSchema = new Schema({
    nombre: { type: String, required: true },
    sexo: { type: String, required: true },
    area: { type: Schema.Types.ObjectId, ref: 'Area', required: true },
    telefono: String,
    ext: String,
    email: String,
    cargo: String,
    iniciales: String,
    status: { type: String, default: "Pendiente" },
}, { timestamps: true });

export default model('Solicitud', SolicitudSchema);