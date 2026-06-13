const mongoose = require('mongoose');
const { Schema } = mongoose;

const OficioSchema = new Schema({

  folio: { type: String, required: true, unique: true },
  tipo: String,
  fecha: { type: Date, default: Date.now },

  area: String,
  asunto: String,
  dirigido: String,
  generado: String,
  relacionados: [{type: Schema.Types.ObjectId, ref: 'Oficio'},
    {type: Schema.Types.ObjectId, ref: 'Documento'},
  ],
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Oficio', OficioSchema);