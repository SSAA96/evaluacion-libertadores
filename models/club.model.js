import mongoose from 'mongoose'

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  numero: { type: Number, required: true, min: 1, max: 99, validate: Number.isInteger },
  posicion: { type: String, required: true, enum: ['arquero', 'defensa', 'mediocampista', 'delantero'] },
}, { _id: false })

const clubSchema = new mongoose.Schema({
  // Los datos originales conservan su ID numérico; los nuevos usan _id de MongoDB.
  id: { type: Number, unique: true, sparse: true, immutable: true, min: 1, validate: Number.isSafeInteger },
  nombre: { type: String, required: true, trim: true, unique: true },
  paisId: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  titulos: { type: [{ type: Number, min: 1900, max: 9999, validate: Number.isInteger }], default: [], required: true },
  jugadores: { type: [jugadorSchema], default: [], required: true },
}, { id: false, timestamps: true, versionKey: false })

export const Club = mongoose.model('Club', clubSchema, 'clubes')
