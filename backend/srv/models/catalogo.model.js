import { Schema, model } from 'mongoose';

const CatalogoSchema = new Schema({
  catalogo: String
}, { timestamps: true });

export default model('Catalogo', CatalogoSchema);