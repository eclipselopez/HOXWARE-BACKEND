import mongoose, {Document, Schema} from 'mongoose';

const urlSchema: Schema = new Schema ({
    proyecto: { type: Schema.Types.ObjectId, ref: 'Proyecto', required: true },
    empresa: { type: String, required: true },
    url: {type: String, required: true },
    plataforma: { type: String, default: 'INTERNO' },
    ipExterna: { type: String, required: true },
    rondaValidacion: { type: String, default: 'R1', required: true },
    responsablePlataforma: { type: String, default: 'POR DEFINIR' },
    fechaUltimaRevision: { type: Date },
    avCriticas:{ type: Number, default: 0 },
    avAltas: { type: Number, default: 0 },
    avMedias: { type: Number, default: 0 },
    avBajas: { type: Number, default: 0 },
    ptCriticas: { type: Number, default: 0 },
    ptAltas: { type: Number, default: 0 },
    ptMedias: { type: Number, default: 0 },
    ptBajas: { type: Number,default: 0 },
    QtrimestreEjecutado: { type: String },
    anoEjecutado: { type: String },
    calificacion: { type: String },
    avOpen: { type: String },
    ptOpen: { type: String },
    rondaActual: { type: String },
    avCriticasMitigadas: { type:Number, default: 0 },
    avAltasMitigadas: { type: Number, default: 0 },
    avMediasMitigadas: { type: Number, default: 0 },
    avBajasMitigadas: { type: Number, default: 0 },
    ptCriticasMitigadas: { type: Number, default: 0 },
    ptAltasMitigadas: { type: Number, default: 0 },
    ptMediasMitigadas: { type: Number, default: 0 },
    ptBajasMitigadas: { type: Number, default: 0 },
    fecha: { type: Date, default: new Date() },
    ejecutadoPor:{ type: String, default:'INDEFINIDO' },
    historial: { type: Array }
}, { collection: 'url'} );

export default mongoose.model('Url', urlSchema);