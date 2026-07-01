import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: String,
  iniciales: String,
  cargo: String,
  area: String,
  telefono: String,
  ext: String,
  email: String,
  status: { type: String, default: "Activo" },
  sexo: String,
  copias: [{ type: Schema.Types.ObjectId, ref: 'Documento' }],
  roles: [{rol: { type: String },
  proceso: { type: String }}
  ],

  tareas: [{tarea: { type: String },
  proceso: { type: String },
  status: { type: String },
  fecha: { type: Date, default: Date.now },
  descripcion: { type: String },
  documento: { type: Schema.Types.ObjectId, ref: 'Documento' }}
  ],

  notificaciones: [{tarea: { type: String },
  proceso: { type: String },
  status: { type: String },
  fecha: { type: Date, default: Date.now },
  descripcion: { type: String },
  documento: { type: Schema.Types.ObjectId, ref: 'Documento' }}
  ],
  resetToken: String,
  resetTokenExpires: Date,
  firstLogin: { type: Boolean, default: true },
  passwordChangedAt: Date,

  createdBy: String,
  updatedBy: String,
}, { timestamps: true });

export default model('users', UserSchema);