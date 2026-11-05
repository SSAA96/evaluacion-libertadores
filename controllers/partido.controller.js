import * as servicio from '../services/partido.service.js'

export async function listarPartidos(req, res) {
  res.json({ partidos: await servicio.buscarPartidos() })
}
export async function obtenerPartido(req, res) {
  res.json(await servicio.buscarPartidoPorId(req.params.id))
}
export async function crearPartido(req, res) {
  res.status(201).json(await servicio.crearPartido(req.body))
}
export async function eliminarPartido(req, res) {
  await servicio.eliminarPartido(req.params.id)
  res.status(204).end()
}
