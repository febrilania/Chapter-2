const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const path = require("path");
const app = express();
const port = 3000;

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

function home(req, res) {
  res.render("index", { data });
}

function addprojectView(req, res) {
  res.render("add-myproject");
}

function addproject(req, res) {
  const { name, startDate, endDate, description } = req.body;

  // console.log("Nama Project :", name);
  // console.log("Tanggal Mulai : ", startDate);
  // console.log("Tanggal Selesai : ", endDate);
  // console.log("Deskripsi : ", description);

  const dataProject = { name, startDate, endDate, description };

  data.unshift(dataProject);

  res.redirect("/");
}

function deleteProject(req, res) {
  const { id } = req.params;
  data.splice(id, 1);

  res.redirect("/");
}

function updateProjectview(req, res) {
  const { id } = req.params;
  const dataFilter = data[parseInt(id)];
  dataFilter.id = parseInt(id);
  res.render("update-project", { data: dataFilter });
}

function updateProject(req, res) {
  const { id, name, startDate, endDate, description } = req.body;

  // console.log("Nama Project :", name);
  // console.log("Tanggal Mulai : ", startDate);
  // console.log("Tanggal Selesai : ", endDate);
  // console.log("Deskripsi : ", description);

  // const dataProject = { id, name, startDate, endDate, description };

  // data.unshift(dataProject);

  data[parseInt(id)] = {
    name,
    startDate,
    endDate,
    description,
  };

  res.redirect("/");
}

function detailproject(req, res) {
  const { id } = req.params;
  const dataFilter = data[parseInt(id)];
  dataFilter.id = parseInt(id);
  res.render("detail-project", { data: dataFilter });
}

function contact(req, res) {
  res.render("contact");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
