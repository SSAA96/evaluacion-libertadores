# API de la Copa Libertadores

API REST con Node.js, Express y Mongoose, conectada a MongoDB Atlas. Los datos se guardan en la base `evaluacion_libertadores`; `datos.js` se utiliza únicamente para la carga inicial.

```text
Petición HTTP → ruta → validación → controlador → servicio → modelo → MongoDB Atlas
```

| Carpeta o archivo | Responsabilidad |
|---|---|
| `config/db.js` | Carga la configuración local y abre/cierra la conexión a MongoDB. |
| `models/` | Esquemas de países, clubes, jugadores y partidos. Los jugadores son subdocumentos del club. |
| `services/` | Consultas, persistencia y reglas del negocio. |
| `controllers/` | Peticiones, respuestas y estados HTTP. |
| `routes/` | Métodos y direcciones de la API. |
| `middlewares/` | Validación de identificadores/cuerpos y manejo centralizado de errores. |
| `app.js` | Configura Express, CORS, JSON y las rutas. |
| `server.js` | Ejecuta la conexión y después inicia el servidor HTTP. |
| `scripts/` | Carga inicial de los datos de la evaluación anterior. |
| `test/` | Pruebas de la API con una base temporal en Atlas. |

## Requisitos

- Node.js 22 o superior.
- Yarn 4.14.1, indicado en `package.json`.
- Una conexión a MongoDB Atlas con permisos sobre la base configurada y acceso desde la IP de este equipo.

## Instalación y ejecución

```powershell
cd C:\Users\sando\source\repos\SSAA96\evaluacion-libertadores
yarn install
```

Si todavía no existe `.env`, copiar el ejemplo y completar la conexión:

```powershell
Copy-Item .env.example .env
```

El servidor escucha en **http://localhost:3000**. Comprobar la conexión con **http://localhost:3000/api/salud**.

Para detenerlo: `Ctrl+C`. Si falla la conexión a Atlas, revisar credenciales, conectividad y la lista de IP permitidas en Atlas. La API espera a conectarse antes de abrir el puerto.

## Endpoints

| Método y ruta | Descripción |
|---|---|
| `GET /api/salud` | Estado de la API y de su conexión. |
| `GET /api/paises` | Países registrados y sus identificadores. |
| `GET /api/clubes` | Listar clubes. |
| `GET /api/clubes?pais=Chile` | Filtrar por país sin distinguir mayúsculas. |
| `GET /api/clubes/:id` | Consultar por `_id` de MongoDB o por ID numérico original. |
| `POST /api/clubes` | Crear un club. |
| `PUT /api/clubes/:id` o `PATCH /api/clubes/:id` | Actualizar los campos enviados de un club. |
| `DELETE /api/clubes/:id` | Eliminar un club sin partidos asociados. |
| `POST /api/clubes/:id/jugadores` | Agregar un jugador al club y guardarlo. |
| `GET /api/titulos/:club` | Títulos por nombre del club, sin distinguir mayúsculas. |
| `GET /api/titulos` | Todos los años de títulos, ordenados. |
| `GET /api/estadisticas` | Total de clubes, títulos y títulos por país. |
| `GET /api/partidos` | Listar partidos. |
| `GET /api/partidos/:id` | Consultar un partido por ObjectId. |
| `POST /api/partidos` | Crear un partido entre dos clubes existentes. |
| `DELETE /api/partidos/:id` | Eliminar un partido. |

Las listas de clubes, países y partidos se devuelven como `{ "clubes": [...] }`, `{ "paises": [...] }` y `{ "partidos": [...] }`. Los títulos se devuelven como `{ "titulos": [...] }`.

Los estados principales son `200` al consultar/actualizar, `201` al crear, `204` al eliminar, `400` para datos inválidos, `404` para recursos inexistentes y `409` para duplicados o clubes con partidos asociados.

## Ejemplos de uso en PowerShell

### Consultar los datos originales

```powershell
Invoke-RestMethod http://localhost:3000/api/clubes
Invoke-RestMethod 'http://localhost:3000/api/clubes?pais=Chile'
Invoke-RestMethod http://localhost:3000/api/clubes/9
Invoke-RestMethod http://localhost:3000/api/estadisticas
```

### Crear un club

`paisId` corresponde al ID numérico de un país de `/api/paises`; Chile es `3`. El nombre es obligatorio y único, y los títulos son años enteros.

```powershell
$nuevoClub = Invoke-RestMethod http://localhost:3000/api/clubes `
  -Method Post -ContentType 'application/json; charset=utf-8' `
  -Body (@{ nombre = 'Club de práctica'; paisId = 3; titulos = @() } | ConvertTo-Json)
$clubId = $nuevoClub._id
```

### Agregar un jugador

El número debe ser un entero entre `1` y `99`. Las posiciones admitidas son `arquero`, `defensa`, `mediocampista` y `delantero`.

```powershell
Invoke-RestMethod "http://localhost:3000/api/clubes/$clubId/jugadores" `
  -Method Post -ContentType 'application/json; charset=utf-8' `
  -Body (@{ nombre = 'Jugador de práctica'; numero = 7; posicion = 'delantero' } | ConvertTo-Json)
```

### Actualizar títulos

```powershell
Invoke-RestMethod "http://localhost:3000/api/clubes/$clubId" `
  -Method Patch -ContentType 'application/json' `
  -Body (@{ titulos = @(2026) } | ConvertTo-Json)
```

### Crear un partido

`local` y `visita` deben ser los `_id` de MongoDB de dos clubes diferentes. Los goles deben ser enteros no negativos; por defecto son `0`.

```powershell
$rival = Invoke-RestMethod http://localhost:3000/api/clubes/9
$partido = Invoke-RestMethod http://localhost:3000/api/partidos `
  -Method Post -ContentType 'application/json; charset=utf-8' `
  -Body (@{
    local = $clubId
    visita = $rival._id
    estadio = 'Estadio de práctica'
    golesLocal = 2
    golesVisita = 1
  } | ConvertTo-Json)
```

### Eliminar los registros del ejemplo

Primero se elimina el partido y después el club, para no dejar referencias a un club inexistente.

```powershell
Invoke-RestMethod "http://localhost:3000/api/partidos/$($partido._id)" -Method Delete
Invoke-RestMethod "http://localhost:3000/api/clubes/$clubId" -Method Delete
```

## Pruebas

```powershell
yarn test
```

Las pruebas requieren la conexión de `.env` y permisos para crear/eliminar una base temporal. Cada ejecución crea una base con nombre aleatorio `libertadores_test_...`, carga sus propios datos y la elimina al terminar. No usan la base de trabajo configurada en `MONGODB_DB`.

Comprueban las consultas originales, filtros, estadísticas, validaciones, duplicados, repetición de la carga inicial, creación/edición/eliminación de clubes, jugadores y referencias de partidos.

## Repositorio y demostración original

- [Repositorio en GitHub](https://github.com/SSAA96/evaluacion-libertadores)
- [Video de la primera evaluación](https://drive.google.com/file/d/1dNKlAyu6DjxAA-P7ibmUQQtX5VJ1c5O8/view?usp=drive_link)

El video corresponde a la versión anterior, con datos en memoria.
