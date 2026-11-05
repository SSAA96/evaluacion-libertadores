import { conectar, desconectar } from './config/db.js'
import { app } from './app.js'

const port = Number(process.env.PORT || 3000)
try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un número entero entre 1 y 65535')
  await conectar()
  console.log('Conexión a MongoDB Atlas establecida')
  const server = app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`))
  server.on('error', async (error) => {
    console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} ya está ocupado` : 'No se pudo iniciar el servidor HTTP')
    await desconectar()
    process.exitCode = 1
  })
  const cerrar = () => server.close(async () => {
    await desconectar()
    process.exit(0)
  })
  process.once('SIGINT', cerrar)
  process.once('SIGTERM', cerrar)
} catch (error) {
  console.error(error.message)
  await desconectar()
  process.exitCode = 1
}
