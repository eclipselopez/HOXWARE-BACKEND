import mongoose, { Schema } from 'mongoose';

export const validRoles = {
    values: [ 'SUDO', 'ADMIN_ROLE', 'USER_ROLE','VISTA_ROLE' ],
    menssage: '{VALUE} is not an allowed role'
}
const userschema: Schema = new Schema ({
    name: { type: String, uppercase: true },
    lastName: { type: String, uppercase: true },
    secondLastName: { type: String, uppercase: true },
    email: { type: String, lowercase: true, unique: true },
    password: { type: String },
    salt: { type: String },
    role: { type: String, enum:validRoles, default: 'ADMIN_ROLE' },
    status: { type: String, default: 'INACTIVO' },
    company: { type: String,},
    license: { type: String, required: true},
    twoAuth: { type: Boolean, default: false },
    code: { type: String },
    saltTA: { type: String }
}, { collection: 'users' } );

export default mongoose.model('User', userschema);