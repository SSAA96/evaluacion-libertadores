import mongoose from 'mongoose'

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Los datos enviados no son válidos',
      detalles: Object.values(error.errors).map(({ path, message }) => ({ campo: path, mensaje: message })),
    })
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `El campo ${error.path} tiene un formato inválido` })
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor', campos: Object.keys(error.keyPattern || {}) })
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no contiene JSON válido' })
  }
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: error.message })
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'La base de datos no está disponible' })
  }
  console.error('Error interno de la API:', error.name)
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor' })
}
