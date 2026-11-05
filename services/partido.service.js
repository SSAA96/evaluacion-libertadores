import { Partido } from '../models/partido.model.js'
import { Club } from '../models/club.model.js'
import { HttpError } from '../utils/http-error.js'

export async function buscarPartidos() {
  return Partido.find().sort({ createdAt: -1 }).lean()
}

export async function buscarPartidoPorId(id) {
  const partido = await Partido.findById(id).lean()
  if (!partido) throw new HttpError(404, 'No existe el partido indicado')
  return partido
}

export async function crearPartido(datos) {
  const partido = new Partido({
    local: datos.local, visita: datos.visita, estadio: datos.estadio,
    golesLocal: datos.golesLocal, golesVisita: datos.golesVisita,
  })
  await partido.validate()
  if (partido.local.equals(partido.visita)) throw new HttpError(400, 'El local y la visita deben ser clubes diferentes')
  const clubes = await Club.countDocuments({ _id: { $in: [partido.local, partido.visita] } })
  if (clubes !== 2) throw new HttpError(404, 'Uno de los clubes del partido no existe')
  return partido.save()
}

export async function eliminarPartido(id) {
  if (!await Partido.findByIdAndDelete(id)) throw new HttpError(404, 'No existe el partido indicado')
}
