import express from 'express'
import cors from 'cors'
import { paises, clubes } from './datos.js'

const app = express()
app.use(cors())

const PORT = 3000

// 👉 aquí van tus rutas

app.listen(PORT, () => {
  console.log(`🏆 API escuchando en http://localhost:${PORT}`)
})