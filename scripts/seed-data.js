import { paises, clubes } from '../datos.js'
import { Pais } from '../models/pais.model.js'
import { Club } from '../models/club.model.js'

export async function cargarDatosIniciales() {
  await Promise.all([Pais.init(), Club.init()])
  // Solo agrega registros faltantes: no borra ni reemplaza datos existentes.
  const resultadoPaises = await Pais.bulkWrite(paises.map((pais) => ({ updateOne: {
    filter: { id: pais.id }, update: { $setOnInsert: pais }, upsert: true,
  } })))
  const resultadoClubes = await Club.bulkWrite(clubes.map((club) => ({ updateOne: {
    filter: { id: club.id }, update: { $setOnInsert: { ...club, jugadores: [] } }, upsert: true, timestamps: false,
  } })))
  return { paisesAgregados: resultadoPaises.upsertedCount, clubesAgregados: resultadoClubes.upsertedCount }
}
