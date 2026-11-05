import { Router } from 'express'
import * as controller from '../controllers/partido.controller.js'
import { validarCuerpo, validarObjectId } from '../middlewares/validaciones.js'

export const partidoRoutes = Router()
partidoRoutes.get('/', controller.listarPartidos)
partidoRoutes.post('/', validarCuerpo, controller.crearPartido)
partidoRoutes.get('/:id', validarObjectId, controller.obtenerPartido)
partidoRoutes.delete('/:id', validarObjectId, controller.eliminarPartido)
