const format = require("pg-format");
const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "ha20030101",
  database: "joyas",
  allowExitOnIdle: true,
});

const runHateoas = (inventario) => {
  const results = inventario
    .map((m) => {
      return {
        nombre: m.nombre,
        href: `/joyas/joyas/${m.id}`,
      };
    })
    .slice(0, 6);
  const total = inventario.length;
  const HATEOAS = {
    total,
    results,
  };
  return HATEOAS;
};

const getInventario = async ({ limits = 6, order_by = "id_ASC", page = 1 }) => {
  const [campo, direccion] = order_by.split("_");
  const offset = (page - 1) * limits;
  const formattedQuery = format(
    "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offset
  );
  pool.query(formattedQuery);
  const { rows: inventario } = await pool.query(formattedQuery);
  return inventario;
};

const inventarioFiltro = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let filtros = [];
  const values = [];

  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };

  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (precio_min) agregarFiltro("precio", ">=", precio_min);
  if (categoria) agregarFiltro("categoria", "=", categoria);
  if (metal) agregarFiltro("metal", "=", metal);

  let consulta = "SELECT * FROM inventario";

  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }
  const { rows: inventario } = await pool.query(consulta, values);
  return inventario;
};

const reportarConsulta = async (req, res, next) => {
  const parametros = req.params;
  const url = req.url;
  console.log(`
  Hoy ${new Date()}
  Se ha recibido una consulta en la ruta ${url}
  `);
  next();
};

module.exports = {
  runHateoas,
  getInventario,
  inventarioFiltro,
  reportarConsulta,
};
