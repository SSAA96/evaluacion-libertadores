import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config({ quiet: true })

export async function conectar({ dbName = process.env.MONGODB_DB || 'evaluacion_libertadores' } = {}) {
  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI en el archivo .env')
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName, serverSelectionTimeoutMS: 10000 })
  } catch {
    // No incluir la cadena de conexión ni sus credenciales en los mensajes.
    throw new Error('No se pudo conectar a MongoDB Atlas. Revisa las credenciales, el acceso de red y la conexión a internet.')
  }
  return mongoose.connection
}

export async function desconectar() {
  await mongoose.disconnect()
}
