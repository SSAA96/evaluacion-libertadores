import mongoose from 'mongoose'

const partidoSchema = new mongoose.Schema({
  local: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  visita: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  estadio: { type: String, required: true, trim: true },
  golesLocal: { type: Number, default: 0, required: true, min: 0, validate: Number.isInteger },
  golesVisita: { type: Number, default: 0, required: true, min: 0, validate: Number.isInteger },
}, { timestamps: true, versionKey: false })

export const Partido = mongoose.model('Partido', partidoSchema, 'partidos')
