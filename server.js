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
        const nombrePais = typeof pais === "string" ? pais.trim() : ""
        const paisEncontrado = paises.find(
            (p) => p.nombre.toLowerCase() === nombrePais.toLowerCase()
        );

        if (!paisEncontrado) {
            return res.status(404).json({
                "error": `No existe el país ${typeof pais === "string" ? pais : "indicado"}`
            });
        }
        
        const clubesFiltrados = clubes.filter(
            (club) => club.paisId === paisEncontrado.id
        ).map(agregarNombrePais);

        return res.json({
            "clubes": clubesFiltrados
        });
    }

    res.status(200).send({
        "clubes": clubes.map(agregarNombrePais)
    })
})

app.get("/api/clubes/:id", (req, res) => {
    const clubIdBusqueda = Number(req.params.id)
    const clubEncontrado = Number.isInteger(clubIdBusqueda)
        ? clubes.find(c => c.id === clubIdBusqueda)
        : undefined
    if (!clubEncontrado) {
        return res.status(404).json({
            "error": `No existe el club ${req.params.id}`
        })
    }

    return res.status(200).json(agregarNombrePais(clubEncontrado))
})

app.get("/api/titulos/:club", (req, res) => {
    const clubNombreBusqueda = req.params.club
    const clubEncontrado = clubes.find(c => c.nombre.toLowerCase() === clubNombreBusqueda.toLowerCase())
    if (!clubEncontrado) {
        return res.status(404).json({
            "error": `No existe el club ${clubNombreBusqueda}`
        })
    }

    return res.status(200).json(clubEncontrado.titulos)
})

app.get("/api/titulos", (req, res) => {
    const todosLosTitulos = clubes
        .flatMap((c) => c.titulos)
        .sort((a, b) => a - b);

    res.status(200).send({
        "titulos": todosLosTitulos
    })
})

app.get("/api/estadisticas", (req, res) => {
    const totalClubes = clubes.length;

    const totalTitulos = clubes.reduce(
        (acc, club) => acc + club.titulos.length,
        0
    );

    const mapaPaises = paises.reduce((acc, p) => {
        acc[p.id] = p.nombre;
        return acc;
    }, {});

    const titulosPorPais = clubes.reduce((acc, club) => {
        const nombrePais = mapaPaises[club.paisId];
        if (nombrePais) {
            acc[nombrePais] = (acc[nombrePais] || 0) + club.titulos.length;
        }
        return acc;
    }, {});

    res.status(200).send({
        totalClubes,
        totalTitulos,
        titulosPorPais,
    })
});

app.listen(PORT, () => {
  console.log(`🏆 API escuchando en http://localhost:${PORT}`)
})
