import mongoose, {Document, Schema} from 'mongoose';

const urlSchema: Schema = new Schema ({
    proyect: { type: Schema.Types.ObjectId, ref: 'Proyect', required: true },
    company: { type: String, required: true },
    url: {type: String, required: true },
    platform: { type: String, default: 'INTERNAL' },
    ipExternal: { type: String, required: true },
    roundValidation: { type: String, default: 'R1', required: true },
    platformManager: { type: String, default: 'TO DEFINE' },
    lastRevisionDate: { type: Date },
    avCritical:{ type: Number, default: 0 },
    avHigh: { type: Number, default: 0 },
    avMedium: { type: Number, default: 0 },
    avLow: { type: Number, default: 0 },
    ptCritical: { type: Number, default: 0 },
    ptHigh: { type: Number, default: 0 },
    ptMedium: { type: Number, default: 0 },
    ptLow: { type: Number,default: 0 },
    QtrimestreExecuted: { type: String },
    yearExecuted: { type: String },
    qualification: { type: String },
    avOpen: { type: String },
    ptOpen: { type: String },
    currentRound: { type: String },
    avMitigatedCriticism: { type:Number, default: 0 },
    avMitigatedHigh: { type: Number, default: 0 },
    avMitigatedMedium: { type: Number, default: 0 },
    avMitigatedLow: { type: Number, default: 0 },
    ptMitigatedCriticism: { type: Number, default: 0 },
    ptMitigatedHigh: { type: Number, default: 0 },
    ptMitigatedMedium: { type: Number, default: 0 },
    ptMitigatedLow: { type: Number, default: 0 },
    date: { type: Date, default: new Date() },
    executedBy:{ type: String, default:'UNDEFINED' },
    history: { type: Array }
}, { collection: 'url'} );

export default mongoose.model('Url', urlSchema);