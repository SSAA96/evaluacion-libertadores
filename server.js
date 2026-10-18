import express from 'express'
import cors from 'cors'
import { paises, clubes } from './datos.js'

const app = express()
app.use(cors())

const PORT = 3000

const agregarNombrePais = (club) => {
    const pais = paises.find((p) => p.id === club.paisId)
    return {
        ...club,
        pais: pais?.nombre ?? null,
    }
}

app.get("/api/clubes", (req, res) => {
    const { pais } = req.query
    if (pais !== undefined) {
        if (typeof pais !== "string" || pais.trim() === "") {
            return res.status(400).json({
                error: "Debe ingresar un nombre de país válido"
            })
        }

        const nombrePais = pais.trim()
        const paisEncontrado = paises.find(
            (p) => p.nombre.toLowerCase() === nombrePais.toLowerCase()
        );

        if (!paisEncontrado) {
            return res.status(404).json({
                "error": `No existe el país ${nombrePais}`
            });
        }
        
        const clubesFiltrados = clubes.filter(
            (club) => club.paisId === paisEncontrado.id
        ).map(agregarNombrePais);

        return res.status(200).json({
            "clubes": clubesFiltrados
        });
    }

    return res.status(200).json({
        "clubes": clubes.map(agregarNombrePais)
    })
})

app.get("/api/clubes/:id", (req, res) => {
    const idSolicitado = req.params.id
    if (!/^\d+$/.test(idSolicitado)) {
        return res.status(400).json({
            error: "El ID debe contener solo números"
        })
    }

    const clubIdBusqueda = Number(idSolicitado)
    if (!Number.isSafeInteger(clubIdBusqueda)) {
        return res.status(400).json({
            error: "El ID debe ser un número entero válido"
        })
    }

    const clubEncontrado = clubes.find(c => c.id === clubIdBusqueda)
    if (!clubEncontrado) {
        return res.status(404).json({
            "error": `No existe el club ${idSolicitado}`
        })
    }

    return res.status(200).json(agregarNombrePais(clubEncontrado))
})

app.get("/api/titulos/:club", (req, res) => {
    const clubNombreBusqueda = req.params.club.trim()
    if (!clubNombreBusqueda) {
        return res.status(400).json({
            error: "Debe ingresar el nombre de un club"
        })
    }

    const clubEncontrado = clubes.find(c => c.nombre.toLowerCase() === clubNombreBusqueda.toLowerCase())
    if (!clubEncontrado) {
        return res.status(404).json({
            "error": `No existe el club ${clubNombreBusqueda || "indicado"}`
        })
    }

    return res.status(200).json(clubEncontrado.titulos)
})

app.get("/api/titulos", (req, res) => {
    const todosLosTitulos = clubes
        .flatMap((c) => c.titulos)
        .sort((a, b) => a - b);

    return res.status(200).json({
        "titulos": todosLosTitulos
    })
})

app.get("/api/estadisticas", (req, res) => {
    const totalClubes = clubes.length;

    const totalTitulos = clubes.reduce(
        (acc, club) => acc + club.titulos.length,
        0
    );

    const titulosPorPais = clubes.reduce((acc, club) => {
        const pais = paises.find((p) => p.id === club.paisId)

        if (pais) {
            acc[pais.nombre] = (acc[pais.nombre] ?? 0) + club.titulos.length
        }

        return acc
    }, {})

    return res.status(200).json({
        totalClubes,
        totalTitulos,
        titulosPorPais,
    })
});

app.listen(PORT, () => {
  console.log(`🏆 API escuchando en http://localhost:${PORT}`)
})
