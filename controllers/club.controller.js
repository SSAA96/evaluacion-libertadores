import * as servicio from '../services/club.service.js'

export async function listarClubes(req, res) {
  res.json({ clubes: await servicio.buscarClubes(req.query.pais) })
}
export async function obtenerClub(req, res) {
  res.json(await servicio.buscarClubPorId(req.params.id))
}
export async function crearClub(req, res) {
  res.status(201).json(await servicio.crearClub(req.body))
}
export async function actualizarClub(req, res) {
  res.json(await servicio.actualizarClub(req.params.id, req.body))
}
export async function eliminarClub(req, res) {
  await servicio.eliminarClub(req.params.id)
  res.status(204).end()
}
export async function agregarJugador(req, res) {
  res.status(201).json(await servicio.agregarJugador(req.params.id, req.body))
}
export async function listarTitulos(req, res) {
  res.json({ titulos: await servicio.todosLosTitulos() })
}
export async function obtenerTitulos(req, res) {
  res.json({ titulos: await servicio.buscarTitulos(req.params.club) })
}
export async function obtenerEstadisticas(req, res) {
  res.json(await servicio.estadisticas())
}
export async function listarPaises(req, res) {
  res.json({ paises: await servicio.buscarPaises() })
}
