import { conectar, desconectar } from '../config/db.js'
import { cargarDatosIniciales } from './seed-data.js'

try {
  const conexion = await conectar()
  const resultado = await cargarDatosIniciales()
  console.log(`Datos iniciales en ${conexion.name}: ${resultado.paisesAgregados} países y ${resultado.clubesAgregados} clubes agregados`)
} catch (error) {
  console.error(error.code === 11000 ? 'Hay datos existentes que entran en conflicto con los datos iniciales' : error.message)
  process.exitCode = 1
} finally {
  await desconectar()
}
