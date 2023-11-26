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

app.get("/detail-project/:id", detailproject);

app.get("/contact", contact);

function home(req, res) {
  res.render("index");
}

function addprojectView(req, res) {
  res.render("add-myproject");
}

function addproject(req, res) {
  const name = req.body.name;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const description = req.body.description;

  console.log("Nama Project :", name);
  console.log("Tanggal Mulai : ", startDate);
  console.log("Tanggal Selesai : ", endDate);
  console.log("Deskripsi : ", description);

  res.redirect("add-myproject");
}

function detailproject(req, res) {
  const id = req.params.id;

  const data = {
    id,
    project: "Project 1",
    start: "21-2-2023",
    end: "26-2-2023",
    deskripsi: "content 1",
  };
  res.render("detail-project", { data });
}

function contact(req, res) {
  res.render("contact");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
