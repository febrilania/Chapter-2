const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const path = require("path");
const app = express();
const port = 3000;
const handlebars = require("handlebars");
const handlebarsEqual = require("handlebars-helper-equal");
const config = require("./src/config/config.json");
const { QueryTypes } = require("sequelize");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const upload = require("./src/middlewares/fileUpload");
const sequelize = new Sequelize(config.development);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static("src/assets"));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use(express.urlencoded({ extended: false })); //membaca data yang dikirim oleh client
app.use(flash());
app.use(
  session({
    name: "data",
    secret: "rahasiabanget",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

handlebars.registerHelper("eq", handlebarsEqual);

const requireLogin = (req, res, next) => {
  if (!req.session.isLogin) {
    req.flash("danger", "Anda harus login untuk mengakses halaman ini.");
    return res.redirect("/login");
  }
  next();
};

app.use((req, res, next) => {
  // Middleware untuk memastikan session tersedia di seluruh rute
  res.locals.user = req.session.user;
  next();
});

app.get("/", requireLogin, home);

app.get("/add-myproject", requireLogin, addprojectView);

app.post("/add-myproject", upload.single("image"), requireLogin, addproject);

app.post("/delete-myproject/:id", requireLogin, deleteProject);

app.get("/update-project/:id", requireLogin, updateProjectview);
app.post(
  "/update-project",
  upload.single("image"),
  requireLogin,
  updateProject
);

app.get("/detail-project/:id", requireLogin, detailproject);

app.get("/contact", requireLogin, contact);

app.get("/register", registerView);
app.post("/register", register);
app.get("/login", loginView);
app.post("/login", login);

app.get("/logout", logOut);

const data = [];

function logOut(req, res) {
  // Hapus sesi pengguna
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/");
    }

    // Redirect ke halaman utama atau halaman login setelah logout
    res.redirect("/login");
  });
}

async function home(req, res) {
  const isLogin = req.session.isLogin;
  const user = req.session.user;
  const query = `SELECT projects.id, projects.name, "startDate", "endDate", description, technologies,
  image, "authorId",users.name AS author, projects."createdAt", projects."updatedAt" FROM projects LEFT JOIN users ON projects."authorId" = users.id`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
  const projectsWithInfo = obj.map((obj) => {
    const icons = {
      nodeJs: obj.technologies.includes("nodeJs") ? "/img/nodejs.png" : "",
      nextJs: obj.technologies.includes("nextJs") ? "/img/nextjs.png" : "",
      reactJs: obj.technologies.includes("reactJs") ? "/img/react.png" : "",
      typeScript: obj.technologies.includes("typeScript")
        ? "/img/typescirpt.png"
        : "",
    };
    return {
      ...obj,
      technologies: obj.technologies.join(", "),
      icons,
    };
  });

  console.log("data project dari database", obj);
  res.render("index", { data: projectsWithInfo, isLogin, user });
}

function addprojectView(req, res) {
  res.render("add-myproject");
}

async function addproject(req, res) {
  const { name, startDate, endDate, description } = req.body;
  const checkboxes = ["nodeJs", "nextJs", "reactJs", "typeScript"].filter(
    (checkbox) => req.body[checkbox]
  );
  const image = req.file.filename;
  const authorId = req.session.user.id;

  const icons = {
    nodeJs: checkboxes.includes("nodeJs") ? "/assets/img/nodejs.png" : "",
    nextJs: checkboxes.includes("nextJs") ? "/assets/img/nextjs.png" : "",
    reactJs: checkboxes.includes("reactJs") ? "/assets/img/react.png" : "",
    typeScript: checkboxes.includes("typeScript")
      ? "/assets/img/typescirpt.png"
      : "",
  };

  const query = `
    INSERT INTO projects(name, "startDate", "endDate", description, technologies, image, "authorId")
    VALUES('${name}', '${startDate}', '${endDate}', '${description}', ARRAY['${checkboxes.join(
    "','"
  )}'], '${image}','${authorId}')
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
  const { id, name, startDate, endDate, description } = req.body;
  const checkboxes = ["nodeJs", "nextJs", "reactJs", "typeScript"].filter(
    (checkbox) => req.body[checkbox]
  );

  const icons = {
    nodeJs: checkboxes.includes("nodeJs") ? "/assets/img/nodejs.png" : "",
    nextJs: checkboxes.includes("nextJs") ? "/assets/img/nextjs.png" : "",
    reactJs: checkboxes.includes("reactJs") ? "/assets/img/react.png" : "",
    typeScript: checkboxes.includes("typeScript")
      ? "/assets/img/typescirpt.png"
      : "",
  };
  let image = "";
  if (req.file) {
    image = req.file.filename;
  }
  if (!image) {
    const query = `SELECT projects.id, projects.name, "startDate", "endDate", description, technologies,
    image, "authorId",users.name AS author, projects."createdAt", projects."updatedAt" FROM projects LEFT JOIN users ON projects."authorId" = users.id WHERE projects.id=${id}`;
    const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
    image = obj[0].image;
  }

  const query = `UPDATE projects SET name='${name}', "startDate"='${startDate}', "endDate"='${endDate}', description='${description}', technologies=ARRAY['${checkboxes.join(
    "','"
  )}'], image='${image}' WHERE id= ${id}`;
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
  const query = `SELECT projects.id, projects.name, "startDate", "endDate", description, technologies,
  image, "authorId",users.name AS author, projects."createdAt", projects."updatedAt" FROM projects LEFT JOIN users ON projects."authorId" = users.id WHERE projects.id=${id}`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });
  const icons = {
    nodeJs: obj[0].technologies.includes("nodeJs") ? "/img/nodejs.png" : "",
    nextJs: obj[0].technologies.includes("nextJs") ? "/img/nextjs.png" : "",
    reactJs: obj[0].technologies.includes("reactJs") ? "/img/react.png" : "",
    typeScript: obj[0].technologies.includes("typeScript")
      ? "/img/typescirpt.png"
      : "",
  };

  res.render("detail-project", { data: obj[0], icons });
}

function contact(req, res) {
  res.render("contact");
}

function loginView(req, res) {
  res.render("login");
}

async function login(req, res) {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email='${email}'`;
  const obj = await sequelize.query(query, { type: QueryTypes.SELECT });

  if (!obj.length) {
    console.error("user not registered!");
    req.flash("danger", "Login failed : email is wrong!");
    return res.redirect("/login");
  }

  bcrypt.compare(password, obj[0].password, (err, result) => {
    if (err) {
      req.flash("danger", "Login failed : internal server error!");
      console.error("Login : Internal Server Error!");
      return res.redirect("/login");
    }

    if (!result) {
      console.error("Password is wrong!");
      req.flash("danger", "Login failed : password is wrong!");
      return res.redirect("/login");
    }

    console.log("Login success!");
    req.flash("success", "Login success!");
    req.session.isLogin = true;
    req.session.user = {
      id: obj[0].id,
      name: obj[0].name,
      email: obj[0].email,
    };

    res.redirect("/");
  });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);

  const salt = 10;

  bcrypt.hash(password, salt, async (err, hash) => {
    if (err) {
      console.error("Password failed to be encrypted!");
      req.flash("danger", "Register failed : password failed to be encrypted!");
      return res.redirect("/register");
    }

    console.log("Hash result :", hash);
    const query = `INSERT INTO users(name, email, password) VALUES ('${name}', '${email}','${hash}')`;

    await sequelize.query(query, { type: QueryTypes.INSERT });
    req.flash("success", "Register success!");
    res.redirect("/");
  });
}

function registerView(req, res) {
  res.render("register");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
