import mongoose from 'mongoose'
import { Club } from '../models/club.model.js'
import { Pais } from '../models/pais.model.js'
import { Partido } from '../models/partido.model.js'
import { HttpError } from '../utils/http-error.js'

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const coincidenciaExacta = (texto) => new RegExp(`^${escaparRegex(texto)}$`, 'i')

function camposClub(datos) {
  return Object.fromEntries(['nombre', 'paisId', 'titulos', 'jugadores']
    .filter((campo) => datos[campo] !== undefined)
    .map((campo) => [campo, datos[campo]]))
}

async function enriquecerClubes(clubes) {
  const paises = await Pais.find({ id: { $in: clubes.map((club) => club.paisId) } }).lean()
  const nombres = new Map(paises.map((pais) => [pais.id, pais.nombre]))
  return clubes.map((club) => ({ ...club, pais: nombres.get(club.paisId) ?? null }))
}

async function obtenerDocumento(id) {
  const club = mongoose.isObjectIdOrHexString(id)
    ? await Club.findById(id)
    : await Club.findOne({ id: Number(id) })
  if (!club) throw new HttpError(404, `No existe el club con ID: ${id}`)
  return club
}

async function validarPais(paisId) {
  if (!await Pais.exists({ id: paisId })) {
    throw new HttpError(400, 'El paisId debe corresponder a un país registrado en /api/paises')
  }
}

export async function buscarClubes(pais) {
  const filtro = {}
  if (pais !== undefined) {
    if (typeof pais !== 'string' || pais.trim() === '') throw new HttpError(400, 'Debe ingresar un nombre de país válido')
    const paisEncontrado = await Pais.findOne({ nombre: coincidenciaExacta(pais.trim()) }).lean()
    if (!paisEncontrado) throw new HttpError(404, `No existe el país ${pais.trim()}`)
    filtro.paisId = paisEncontrado.id
  }
  return enriquecerClubes(await Club.find(filtro).sort({ id: 1, nombre: 1 }).lean())
}

export async function buscarClubPorId(id) {
  const club = await obtenerDocumento(id)
  const [resultado] = await enriquecerClubes([club.toObject()])
  return resultado
}

export async function crearClub(datos) {
  const club = new Club(camposClub(datos))
  await club.validate()
  await validarPais(club.paisId)
  await club.save()
  return buscarClubPorId(club._id.toString())
}

export async function actualizarClub(id, datos) {
  const cambios = camposClub(datos)
  if (!Object.keys(cambios).length) throw new HttpError(400, 'Debe enviar al menos un campo del club para actualizar')
  const club = await obtenerDocumento(id)
  club.set(cambios)
  await club.validate()
  await validarPais(club.paisId)
  await club.save()
  return buscarClubPorId(club._id.toString())
}

export async function eliminarClub(id) {
  const club = await obtenerDocumento(id)
  if (await Partido.exists({ $or: [{ local: club._id }, { visita: club._id }] })) {
    throw new HttpError(409, 'El club tiene partidos asociados; elimina primero esos partidos')
  }
  await club.deleteOne()
}

export async function agregarJugador(id, jugador) {
  const club = await obtenerDocumento(id)
  club.jugadores.push({ nombre: jugador.nombre, numero: jugador.numero, posicion: jugador.posicion })
  await club.save()
  return buscarClubPorId(club._id.toString())
}

export async function buscarTitulos(nombre) {
  if (typeof nombre !== 'string' || !nombre.trim()) throw new HttpError(400, 'Debe ingresar el nombre de un club')
  const club = await Club.findOne({ nombre: coincidenciaExacta(nombre.trim()) }).lean()
  if (!club) throw new HttpError(404, `No existe el club ${nombre.trim()}`)
  return club.titulos
}

export async function todosLosTitulos() {
  const clubes = await Club.find().select('titulos').lean()
  return clubes.flatMap((club) => club.titulos).sort((a, b) => a - b)
}

export async function estadisticas() {
  const grupos = await Club.aggregate([{ $group: {
    _id: '$paisId', clubes: { $sum: 1 }, titulos: { $sum: { $size: '$titulos' } },
  } }])
  const paises = await Pais.find().sort({ id: 1 }).lean()
  const gruposPorPais = new Map(grupos.map((grupo) => [grupo._id, grupo]))
  return {
    totalClubes: grupos.reduce((total, grupo) => total + grupo.clubes, 0),
    totalTitulos: grupos.reduce((total, grupo) => total + grupo.titulos, 0),
    titulosPorPais: Object.fromEntries(paises.filter((pais) => gruposPorPais.has(pais.id))
      .map((pais) => [pais.nombre, gruposPorPais.get(pais.id).titulos])),
  }
}

export async function buscarPaises() {
  return Pais.find().sort({ id: 1 }).lean()
}
