// Un país agrupa clubes
export const paises = [
  { id: 1, nombre: 'Argentina' },
  { id: 2, nombre: 'Brasil' },
  { id: 3, nombre: 'Chile' },
  { id: 4, nombre: 'Uruguay' },
  { id: 5, nombre: 'Paraguay' },
]

// Cada club pertenece a UN país (por su id).
// `titulos` = los años de las Copas Libertadores que ganó.
export const clubes = [
  { id: 1,  nombre: 'Boca Juniors',          paisId: 1, titulos: [1977, 1978, 2000, 2001, 2003, 2007] },
  { id: 2,  nombre: 'River Plate',           paisId: 1, titulos: [1986, 1996, 2015, 2018] },
  { id: 3,  nombre: 'Independiente',         paisId: 1, titulos: [1964, 1965, 1972, 1973, 1974, 1975, 1984] },
  { id: 4,  nombre: 'Racing Club',           paisId: 1, titulos: [1967] },
  { id: 5,  nombre: 'São Paulo',             paisId: 2, titulos: [1992, 1993, 2005] },
  { id: 6,  nombre: 'Santos',                paisId: 2, titulos: [1962, 1963, 2011] },
  { id: 7,  nombre: 'Grêmio',                paisId: 2, titulos: [1983, 1995, 2017] },
  { id: 8,  nombre: 'Botafogo',              paisId: 2, titulos: [2024] },
  { id: 9,  nombre: 'Colo-Colo',             paisId: 3, titulos: [1991] },
  { id: 10, nombre: 'Universidad de Chile',  paisId: 3, titulos: [] },
  { id: 11, nombre: 'Universidad Católica',  paisId: 3, titulos: [] },
  { id: 12, nombre: 'Cobreloa',              paisId: 3, titulos: [] },
  { id: 13, nombre: 'Peñarol',               paisId: 4, titulos: [1960, 1961, 1966, 1982, 1987] },
  { id: 14, nombre: 'Nacional',              paisId: 4, titulos: [1971, 1980, 1988] },
  { id: 15, nombre: 'Olimpia',               paisId: 5, titulos: [1979, 1990, 2002] },
  { id: 16, nombre: 'Cerro Porteño',         paisId: 5, titulos: [] },
]