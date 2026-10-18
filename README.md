# API de la Copa Libertadores

API REST construida con Node.js y Express para consultar clubes de la Copa Libertadores, sus países y los años en que ganaron el torneo. Los datos están definidos en `datos.js`.

## Requisitos

- Node.js 20 o superior
- Yarn

## Instalación y ejecución

Desde la carpeta del proyecto, instala las dependencias y levanta el servidor:

```bash
yarn
yarn dev
```

El servidor queda disponible en **http://localhost:3000**. El comando `yarn dev` usa `node --watch`, por lo que reinicia el servidor cuando se modifica un archivo.

## Endpoints

| Método y ruta | Descripción | Respuesta esperada |
| --- | --- | --- |
| `GET /api/clubes` | Lista los 16 clubes. | `200`, objeto con la propiedad `clubes`. |
| `GET /api/clubes/:id` | Busca un club por su ID. | `200` con el club; `400` si el ID no contiene solo números; `404` si el ID no existe. |
| `GET /api/clubes?pais=Chile` | Filtra los clubes por país; no distingue mayúsculas. | `200`, objeto con la propiedad `clubes`; `400` si el parámetro está vacío o repetido; `404` si el país no existe. |
| `GET /api/titulos/:club` | Busca los años de títulos por nombre del club; no distingue mayúsculas. | `200` con un array, incluso `[]` si no tiene títulos; `400` si el nombre está vacío; `404` si el club no existe. |
| `GET /api/titulos` | Lista todos los años de títulos en orden ascendente. | `200` con la propiedad `titulos`. |
| `GET /api/estadisticas` | Resume clubes, títulos totales y títulos por país. | `200` con los totales y el desglose por país. |

Ejemplos:

```text
GET http://localhost:3000/api/clubes
GET http://localhost:3000/api/clubes/9
GET http://localhost:3000/api/clubes?pais=Chile
GET http://localhost:3000/api/titulos
GET http://localhost:3000/api/titulos/colo-colo
GET http://localhost:3000/api/estadisticas
```

Un club que existe pero no ha ganado la Copa devuelve `200` con `[]`. Un ID, país o nombre de club inexistente devuelve `404`; los parámetros con formato inválido devuelven `400`. Los errores incluyen un objeto JSON con `error`.

## Video de demostración

[Ver video en Google Drive](https://drive.google.com/file/d/1dNKlAyu6DjxAA-P7ibmUQQtX5VJ1c5O8/view?usp=drive_link) Duración 20 minutos
