const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const path = require("path");
const app = express();
const port = 3000;
const config = require("./src/config/config.json");
const { QueryTypes } = require("sequelize");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.development);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static("src/assets"));
app.use(express.urlencoded({ extended: false })); //membaca data yang dikirim oleh client

app.get("/", home);

app.get("/add-myproject", addprojectView);

app.post("/add-myproject", addproject);

app.post("/delete-myproject/:id", deleteProject);

app.get("/update-project/:id", updateProjectview);
app.post("/update-project", updateProject);

app.get("/detail-project/:id", detailproject);

app.get("/contact", contact);

const data = [];

async function home(req, res) {
  const query = "SELECT * FROM projects";
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
  console.log("data project dari database", obj);
  res.render("index", { data: obj });
}

function addprojectView(req, res) {
  res.render("add-myproject");
}

async function addproject(req, res) {
  const { name, startDate, endDate, description, technologies } = req.body;
  const image = "brandred.png";

  const query = `
    INSERT INTO projects(name, "startDate", "endDate", description, technologies, image)
    VALUES('${name}', '${startDate}', '${endDate}', '${description}', ARRAY['${technologies}'], '${image}')
  `;
  const obj = await sequelize.query(query, { type: QueryTypes.INSERT });

  res.redirect("/");
}

async function deleteProject(req, res) {
  const { id } = req.params;
  const query = `DELETE FROM projects WHERE id=${id}`;
  const obj = await sequelize.query(query, { type: QueryTypes.DELETE });

  res.redirect("/");
}

async function updateProjectview(req, res) {
  const { id } = req.params;
  // const dataFilter = data[parseInt(id)];
  // dataFilter.id = parseInt(id);
  const query = `SELECT * FROM projects WHERE id= ${id}`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
  res.render("update-project", { data: obj[0] });
}

async function updateProject(req, res) {
  const { id, name, startDate, endDate, description, technologies } = req.body;

  const query = `UPDATE projects SET name='${name}', "startDate"='${startDate}', "endDate"='${endDate}', description='${description}', technologies=ARRAY['${technologies}'] WHERE id= ${id}`;
  const obj = await sequelize.query(query, { type: QueryTypes.UPDATE });

  // console.log("Nama Project :", name);
  // console.log("Tanggal Mulai : ", startDate);
  // console.log("Tanggal Selesai : ", endDate);
  // console.log("Deskripsi : ", description);

  // const dataProject = { id, name, startDate, endDate, description };

  // data.unshift(dataProject);

  // data[parseInt(id)] = {
  //   name,
  //   startDate,
  //   endDate,
  //   description,
  // };

  res.redirect("/");
}

async function detailproject(req, res) {
  const { id } = req.params;
  const query = `SELECT * FROM projects WHERE id= ${id}`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
  res.render("detail-project", { data: obj[0] });
}

function contact(req, res) {
  res.render("contact");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
