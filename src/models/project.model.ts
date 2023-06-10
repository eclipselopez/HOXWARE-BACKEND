import mongoose, { Schema } from 'mongoose';

const projectSchema: Schema = new Schema ({
    owner: { type: String },
    name: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    logo: { type: String },
    type: { type: String },
    initDate: { type: Date, default: Date.now },
    finishDate: { type: Date },
    license: { type: Array }
}, { collection: 'projects'} );

export default mongoose.model('Project', projectSchema);