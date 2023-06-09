import mongoose, { Schema } from 'mongoose';

const proyectoSchema: Schema = new Schema ({
    propietario: { type: String },
    nombre: { type: String, required: true, unique: true },
    proveedor: { type: String, required: true },
    logo: { type: String },
    tipo: { type: String },
    fechaInicio: { type: Date, default: Date.now },
    fechaTermino: { type: Date },
    permisos: { type: Array }
}, { collection: 'proyectos'} );

export default mongoose.model('Proyecto', proyectoSchema);