import { Schema, model } from 'mongoose';

const AreaSchema = new Schema({
  clave: { type: String, required: true, unique: true },
  nombre: String,
  abreviatura: String,
  direccion: Boolean,
  pertenece: { type: Schema.Types.ObjectId, ref: 'Area' },
  tareas: [{tarea: { type: String },
    proceso: { type: String },
    status: { type: String },
    fecha: { type: Date, default: Date.now },
    descripcion: { type: String },
    documento: { type: Schema.Types.ObjectId, ref: 'Documento' }}
    ],
}, { timestamps: true });

export default model('Area', AreaSchema);