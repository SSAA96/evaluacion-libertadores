import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { apiRoutes } from './routes/api.routes.js'
import { errorHandler } from './middlewares/error-handler.js'

export const app = express()
app.use(cors())
app.use(express.json({ limit: '100kb' }))
app.get('/api/salud', (req, res) => {
  const conectada = mongoose.connection.readyState === 1
  res.status(conectada ? 200 : 503).json({
    estado: conectada ? 'ok' : 'no disponible', baseDeDatos: conectada ? 'conectada' : 'desconectada',
  })
})
app.use('/api', apiRoutes)
app.use((req, res) => res.status(404).json({ error: 'La ruta solicitada no existe' }))
app.use(errorHandler)
