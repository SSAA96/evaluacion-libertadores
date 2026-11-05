import mongoose from 'mongoose'
import { HttpError } from '../utils/http-error.js'

export function validarIdClub(req, res, next) {
  const { id } = req.params
  const numero = Number(id)
  const esIdAnterior = /^\d+$/.test(id) && Number.isSafeInteger(numero) && numero > 0
  if (!mongoose.isObjectIdOrHexString(id) && !esIdAnterior) {
    return next(new HttpError(400, 'El ID debe ser un ObjectId válido o un ID numérico de los datos originales'))
  }
  next()
}

export function validarObjectId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return next(new HttpError(400, 'El ID debe ser un ObjectId válido de MongoDB'))
  }
  next()
}

export function validarCuerpo(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new HttpError(400, 'Debe enviar un objeto JSON en el cuerpo de la petición'))
  }
  next()
}
