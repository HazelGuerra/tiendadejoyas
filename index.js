const express = require("express");
const app = express();
app.listen(3000, console.log("Servidor encendido!"));
app.use(express.json());
const {
  getInventario,
  runHateoas,
  inventarioFiltro,
  reportarConsulta,
} = require("./consultas");

app.get("/joyas", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await getInventario(queryStrings);
    const HATEOAS = await runHateoas(inventario);
    res.json(HATEOAS);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

app.get("/joyas/filtros", reportarConsulta, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await inventarioFiltro(queryStrings);
    res.json(joyas);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
