import path from "path";
import express from "express";
import { engine } from "express-handlebars";
import { readFile, writeFile } from "fs/promises";

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = import.meta.dirname;

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "/views"));

async function loadData() {
  const file = await readFile(path.join(__dirname, "./data/deportes.json"));
  const data = JSON.parse(file);
  return data;
}

async function saveData(data) {
  await writeFile(
    path.join(__dirname, "./data/deportes.json"),
    JSON.stringify(data)
  );
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/deportes", async (req, res) => {
  try {
    const deportesData = await loadData();

    return res.status(200).json({
      deportes: deportesData,
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
});

app.get("/agregar", async (req, res) => {
  try {
    const deportesData = await loadData();

    const { nombre, precio } = req.query;
    const deporte = {
      nombre: nombre,
      precio: precio,
    };
    deportesData.push(deporte);
    await saveData(deportesData);
    res
      .send(`Se ha agregado el deporte ${nombre} con exito!`)
      .redirect(req.get("referer"));
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
});

app.get("/editar", async (req, res) => {
  try {
    const deportesData = await loadData();
    const { nombre, precio } = req.query;

    deportesData.forEach((e) => {
      if (e.nombre == nombre) {
        e.precio = precio;
      }
    });
    await saveData(deportesData);
    res
      .send(`Se ha editado el precio del Deporte ${nombre} con exito!`)
      .redirect(req.get("referer"));
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
});

app.get("/eliminar", async (req, res) => {
  try {
    const deportesData = await loadData();
    const { nombre } = req.query;

    const toDeleteIndex = deportesData.findIndex((e) => e.nombre == nombre);
    if (toDeleteIndex !== -1) {
      deportesData.splice(toDeleteIndex, 1);
    }

    await saveData(deportesData);
    res
      .send(`Se ha eliminado el Deporte ${nombre} con exito!`)
      .redirect(req.get("referer"));
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});
