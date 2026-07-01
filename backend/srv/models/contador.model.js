import moongoose from "mongoose";

const ContadorSchema = new moongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    valor: { type: Number, default: 0 },
}, { timestamps: true });

export default moongoose.model('Contador', ContadorSchema);