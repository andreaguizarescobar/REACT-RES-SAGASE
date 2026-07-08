import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;

const EliminadoSchema = new Schema({
  docId: { type: String, required: true, index: true },
  folio: { type: String },
  motivoEliminacion: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  fechaEliminacion: { type: Date, default: Date.now },
}, { timestamps: true });

export default model('Eliminado', EliminadoSchema);