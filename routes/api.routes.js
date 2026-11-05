import { Router } from 'express'
import { clubRoutes } from './club.routes.js'
import { partidoRoutes } from './partido.routes.js'
import * as controller from '../controllers/club.controller.js'

export const apiRoutes = Router()
apiRoutes.use('/clubes', clubRoutes)
apiRoutes.use('/partidos', partidoRoutes)
apiRoutes.get('/paises', controller.listarPaises)
apiRoutes.get('/titulos', controller.listarTitulos)
apiRoutes.get('/titulos/:club', controller.obtenerTitulos)
apiRoutes.get('/estadisticas', controller.obtenerEstadisticas)
