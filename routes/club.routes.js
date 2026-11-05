import { Router } from 'express'
import * as controller from '../controllers/club.controller.js'
import { validarCuerpo, validarIdClub } from '../middlewares/validaciones.js'

export const clubRoutes = Router()
clubRoutes.get('/', controller.listarClubes)
clubRoutes.post('/', validarCuerpo, controller.crearClub)
clubRoutes.get('/:id', validarIdClub, controller.obtenerClub)
clubRoutes.put('/:id', validarIdClub, validarCuerpo, controller.actualizarClub)
clubRoutes.patch('/:id', validarIdClub, validarCuerpo, controller.actualizarClub)
clubRoutes.delete('/:id', validarIdClub, controller.eliminarClub)
clubRoutes.post('/:id/jugadores', validarIdClub, validarCuerpo, controller.agregarJugador)
