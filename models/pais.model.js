import mongoose from 'mongoose'

const paisSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, min: 1, validate: Number.isSafeInteger },
  nombre: { type: String, required: true, trim: true, unique: true },
}, { id: false, versionKey: false })

export const Pais = mongoose.model('Pais', paisSchema, 'paises')
