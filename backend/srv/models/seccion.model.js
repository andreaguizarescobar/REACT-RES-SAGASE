import Schema from "mongoose";

const seccionSchema = new Schema({
    seccion: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    descripcion: { 
        type: String,
    },
    series: [{
        serie: {
            type: String,
            unique: true,
        },
        descripcion: {
            type: String,
        },
        subseries: [{
            subserie: {
                type: String,
                unique: true,
            },
            descripcion: {
                type: String,
            },
        }]
    }],
}, {
    timestamps: true,
    versionKey: false,
});

export default model("Seccion" ,seccionSchema);