const express = require("express");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  app.use(cors());
  next();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "C:/Users/Romulo/Desktop/tmp");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: "mysql",
});

sequelize
  .sync()
  .then(() => {
    console.log("Modelo sincronizado com o banco de dados.");
  })
  .catch((err) => {
    console.error("Erro ao sincronizar o modelo com o banco de dados: " + err);
  });

const User = sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    tagname: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  },

  {
    freezeTableName: true,
    timestamps: false,
    tableName: "user",
  }
);
const Post = sequelize.define(
  "Post",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    img: DataTypes.STRING,
    description: Sequelize.UUID,
    user_id: Sequelize.UUID,
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "posts",
  }
);
const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    comment: DataTypes.STRING,
    post_id: Sequelize.UUID,
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "comments",
  }
);

User.hasMany(Post, {
  foreignKey: "user_id",
});

Post.hasMany(Comment, {
  foreignKey: "post_id",
});

/* Comment.belongsTo(User, {
  foreignKey: "owner_id",
}); */

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401);
  }

  try {
    jwt.verify(token, "123");
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido", token: token, tokena: "asd" });
  }
}

const imagesDirectory = "C:/Users/Romulo/Desktop/tmp";

app.get("/getpostimage/:name", async (req, res) => {
  const { name } = req.params;
  const imagePath = path.join(imagesDirectory, `${name}`);
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.log(err);
      res.status(404).send(err + "Imagem não encontrada.");
    }
  });
});

app.get("/auth/register", async (req, res) => {
  try {
    const users = await User.findAll();

    res.send("Usuários: " + JSON.stringify(users));
  } catch (error) {
    console.error("Erro ao buscar os usuários: " + error);
    res.sendStatus(500);
  }
});

app.post("/auth/register", async (req, res) => {
  console.log(req.body);
  try {
    const { username, tagname, email, password } = req.body;
    if (password.length < 8) {
      return;
    }
    const newUser = await User.create({
      id: uuidv4(),
      tagname,
      username,
      email,
      password,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao criar o usuário: " + error);
    res.sendStatus(500);
  }
});

app.post("/auth/login", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const newUser = await User.findOne({ where: { email: email } });

    if (password === newUser.password) {
      const token = jwt.sign({ id: newUser.id }, "123");
      res.status(201).json({ token: token });
    }
  } catch (error) {
    console.error("Erro ao logar: " + error);
    res.sendStatus(500);
  }
});

app.post("/create/comment/:postid", authToken, async (req, res) => {
  const { comment } = req.body;
  const postid = req.params["postid"];
  const token = req.headers["authorization"].split(" ")[1];
  const { id } = jwt.decode(token);
  try {
    const newComment = await Comment.create({
      id: uuidv4(),
      comment,
      post_id: postid,
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Erro ao criar comentário: " + error);
    res.sendStatus(500);
  }
});

app.get("/post/comment/:id", async (req, res) => {
  const id = req.params["id"];
  console.log(id);

  try {
    const comment = await Comment.findAll({
      where: { post_id: id },
      /* include: {
        model: User,
        attributes: { exclude: ["password", "email"] },
      }, */
    });

    res.send(JSON.stringify({ comment }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/create/post", upload.single("img"), authToken, async (req, res) => {
  const { description } = req.body;
  console.log(req.body);
  console.log(req.file.filename.split(".")[0]);
  const token = req.headers["authorization"].split(" ")[1];
  const { id } = jwt.decode(token);
  try {
    const newPost = await Post.create({
      id: uuidv4(),
      img: req.file.filename.split(".")[0],
      description,
      user_id: id,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Erro ao criar post: " + error);
    res.sendStatus(500);
  }
});

app.get("/get/post", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { id } = jwt.decode(token);

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Post,
          attributes: { exclude: ["user_id"] },
        },
      ],
    });

    res.send(JSON.stringify({ user }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Servidor Express iniciado na porta 3000.");
});
