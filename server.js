const express = require("express");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const ImageKit = require("imagekit");
const fs = require("fs");

const cors = require("cors");
//const path = require("path");
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  app.use(cors());
  next();
});

const imagekit = new ImageKit({
  publicKey: "public_saF/Owtr0cpKt5lyvCgBSaI32qQ=",
  privateKey: "private_h9SASm5V7LcxbmxF03sG7eNHzlg=",
  urlEndpoint: "https://ik.imagekit.io/e82dsgvbi/",
});

const multerMemoryStorage = multer.memoryStorage();

const multerConfig = {
  storage: multerMemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de tamanho do arquivo (10MB)
  },
};

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
    privacy: Sequelize.STRING,
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

app.get("/get/post/image/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const imageFile = await imagekit.getFileDetails(id);
    console.log(imageFile);
    res.send(JSON.stringify({ url: imageFile.url }));
  } catch {
    (err) => {
      res.send(err);
    };
  }
});

app.get("/get/user/:id", async (req, res) => {
  const id = req.params["id"];
  try {
    const users = await User.findByPk(id, { attributes: { exclude: ["password"] } });

    res.send(JSON.stringify({users}));
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

app.post("/create/post", multer(multerConfig).single("image"), authToken, async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { id } = jwt.decode(token);
  const { description, privacy } = req.body;
  const base64image = req.file.buffer.toString("base64");
  var imageURL;
  try {
    imageURL = await imagekit
      .upload({
        file: base64image,
        fileName: "my_file_name.jpg",
      })
      .then((response) => {
        console.log(response);
        return response.url;
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.error("Erro fazer upload da imagem: " + error);
    res.sendStatus(500);
  }
  try {
    const newPost = await Post.create({
      id: uuidv4(),
      img: imageURL,
      description,
      privacy: privacy,
      user_id: id,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Erro ao criar post: " + error);
    res.sendStatus(500);
  }
});

app.get("/get/post/:privacy", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const privacy = req.params["privacy"];
  const { id } = jwt.decode(token);

  try {
    const posts = await Post.findAll({
      where: { privacy: privacy },
    });

    res.send(JSON.stringify({ posts }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Servidor Express iniciado na porta 3000.");
});
