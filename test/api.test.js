import { test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import { app } from '../app.js'
import { conectar, desconectar } from '../config/db.js'
import { cargarDatosIniciales } from '../scripts/seed-data.js'
import { clubes as datosIniciales } from '../datos.js'

test('API completa con persistencia real en Atlas', { timeout: 120000 }, async (t) => {
  const dbName = `libertadores_test_${randomUUID().replaceAll('-', '').slice(0, 16)}`
  const conexion = await conectar({ dbName })
  let server
  t.after(async () => {
    try {
      if (server) await new Promise((resolve) => server.close(resolve))
      // Solo elimina la base temporal creada por esta ejecución, nunca la de .env.
      assert.equal(conexion.name, dbName)
      assert.match(conexion.name, /^libertadores_test_[a-f0-9]{16}$/)
      await conexion.dropDatabase()
    } finally {
      await desconectar()
    }
  })

  const carga = await cargarDatosIniciales()
  assert.deepEqual(carga, { paisesAgregados: 5, clubesAgregados: 16 })
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}/api`
  async function pedir(ruta, { method = 'GET', body, raw } = {}) {
    const response = await fetch(base + ruta, {
      method,
      headers: body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
    return { status: response.status, body: response.status === 204 ? null : await response.json() }
  }

  await t.test('conserva consultas, filtros, títulos y estadísticas de la evaluación original', async () => {
    assert.equal((await pedir('/salud')).status, 200)
    const lista = await pedir('/clubes')
    assert.equal(lista.body.clubes.length, 16)
    const colo = await pedir('/clubes/9')
    assert.equal(colo.body.nombre, 'Colo-Colo')
    assert.equal(colo.body.pais, 'Chile')
    assert.equal((await pedir(`/clubes/${colo.body._id}`)).body.nombre, 'Colo-Colo')
    assert.equal((await pedir('/clubes?pais=cHiLe')).body.clubes.length, 4)
    assert.deepEqual((await pedir('/titulos/colo-colo')).body.titulos, [1991])
    assert.deepEqual((await pedir('/titulos/Universidad%20de%20Chile')).body.titulos, [])
    const titulos = datosIniciales.flatMap((club) => club.titulos).sort((a, b) => a - b)
    assert.deepEqual((await pedir('/titulos')).body.titulos, titulos)
    const stats = (await pedir('/estadisticas')).body
    assert.equal(stats.totalClubes, 16)
    assert.equal(stats.totalTitulos, titulos.length)
    assert.equal(stats.titulosPorPais.Chile, 1)
    assert.equal((await pedir('/paises')).body.paises.length, 5)
  })

  await t.test('rechaza identificadores, consultas y cuerpos inválidos', async () => {
    for (const ruta of ['/clubes/no-es-id', '/clubes/0', '/clubes/1.5', '/clubes/9007199254740992', '/partidos/no-es-id']) {
      assert.equal((await pedir(ruta)).status, 400, ruta)
    }
    for (const ruta of ['/clubes?pais=', '/clubes?pais=Chile&pais=Brasil']) {
      assert.equal((await pedir(ruta)).status, 400, ruta)
    }
    for (const ruta of ['/clubes/99999', '/clubes/000000000000000000000000', '/clubes?pais=Atlantida', '/clubes?pais=.*', '/titulos/.*', '/no-existe']) {
      assert.equal((await pedir(ruta)).status, 404, ruta)
    }
    assert.equal((await pedir('/clubes', { method: 'POST', raw: '{' })).status, 400)
    for (const body of [[], {}, { nombre: 'Inválido', paisId: 999 }, { nombre: 'Inválido', paisId: 3, titulos: null }]) {
      assert.equal((await pedir('/clubes', { method: 'POST', body })).status, 400)
    }
    assert.equal((await pedir('/clubes/9', { method: 'PATCH', body: {} })).status, 400)
    assert.equal((await pedir('/clubes', { method: 'POST', body: { nombre: 'Colo-Colo', paisId: 3 } })).status, 409)
  })

  await t.test('la carga inicial se puede repetir sin perder modificaciones', async () => {
    await pedir('/clubes/9', { method: 'PATCH', body: { nombre: 'Colo-Colo editado' } })
    assert.deepEqual(await cargarDatosIniciales(), { paisesAgregados: 0, clubesAgregados: 0 })
    assert.equal((await pedir('/clubes/9')).body.nombre, 'Colo-Colo editado')
    await pedir('/clubes/9', { method: 'PATCH', body: { nombre: 'Colo-Colo' } })
  })

  await t.test('crea, consulta, actualiza y elimina un club; persiste jugadores y partidos', async () => {
    const nuevo = await pedir('/clubes', { method: 'POST', body: { nombre: 'Club de prueba', paisId: 3, titulos: [] } })
    assert.equal(nuevo.status, 201)
    const id = nuevo.body._id
    assert.match(id, /^[a-f0-9]{24}$/)
    assert.equal((await pedir(`/clubes/${id}`)).body.nombre, 'Club de prueba')

    const jugador = { nombre: 'Jugador de prueba', numero: 7, posicion: 'delantero' }
    assert.equal((await pedir(`/clubes/${id}/jugadores`, { method: 'POST', body: { ...jugador, numero: 100 } })).status, 400)
    assert.equal((await pedir(`/clubes/${id}/jugadores`, { method: 'POST', body: { ...jugador, posicion: 'inventada' } })).status, 400)
    assert.equal((await pedir(`/clubes/${id}/jugadores`, { method: 'POST', body: jugador })).status, 201)
    assert.deepEqual((await pedir(`/clubes/${id}`)).body.jugadores, [jugador])
    const cambio = await pedir(`/clubes/${id}`, { method: 'PATCH', body: { titulos: [2026] } })
    assert.deepEqual(cambio.body.titulos, [2026])
    assert.equal((await pedir('/estadisticas')).body.totalClubes, 17)

    const rival = (await pedir('/clubes/9')).body._id
    const datosPartido = { local: id, visita: rival, estadio: 'Estadio de prueba', golesLocal: 2, golesVisita: 1 }
    assert.equal((await pedir('/partidos', { method: 'POST', body: { ...datosPartido, visita: id } })).status, 400)
    assert.equal((await pedir('/partidos', { method: 'POST', body: { ...datosPartido, golesLocal: -1 } })).status, 400)
    assert.equal((await pedir('/partidos', { method: 'POST', body: { ...datosPartido, visita: '000000000000000000000000' } })).status, 404)
    const partido = await pedir('/partidos', { method: 'POST', body: datosPartido })
    assert.equal(partido.status, 201)
    assert.equal((await pedir(`/partidos/${partido.body._id}`)).body.local, id)
    assert.equal((await pedir('/partidos')).body.partidos.length, 1)
    assert.equal((await pedir(`/clubes/${id}`, { method: 'DELETE' })).status, 409)
    assert.equal((await pedir(`/partidos/${partido.body._id}`, { method: 'DELETE' })).status, 204)
    assert.equal((await pedir(`/clubes/${id}`, { method: 'DELETE' })).status, 204)
    assert.equal((await pedir(`/clubes/${id}`)).status, 404)
    assert.equal((await pedir('/estadisticas')).body.totalClubes, 16)
  })
})
