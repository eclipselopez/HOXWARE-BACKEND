import mongoose, { Schema } from 'mongoose';

export const rolesValidos = {
    values: [ 'SUDO', 'ADMIN_ROLE', 'USER_ROLE','VISTA_ROLE' ],
    menssage: '{VALUE} no es un role permitido'
}
const usuarioSchema: Schema = new Schema ({
    nombre: { type: String, uppercase: true },
    apellidoP: { type: String, uppercase: true },
    apellidoM: { type: String, uppercase: true },
    email: { type: String, lowercase: true, unique: true },
    password: { type: String },
    salt: { type: String },
    licencia: { type: String, required: true},
    role: { type: String, enum:rolesValidos, default: 'ADMIN_ROLE' },
    status: { type: String, default: 'INACTIVO' },
    empresa: { type: String,},
    twoAuth: { type: Boolean, default: false },
    codigo: { type: String },
    saltTA: { type: String }
}, { collection: 'usuarios' } );

export default mongoose.model('Usuario', usuarioSchema);