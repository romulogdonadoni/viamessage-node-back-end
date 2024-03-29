const express = require("express");
const sequelize = require("./config/sequelizeConfig");
const cors = require("cors");

const PostModel = require("./models/postModel");
const UserModel = require("./models/userModel");
const CommentModel = require("./models/commentModel");
const FollowModel = require("./models/followModel");

const authLogin = require("./routes/authLogin");
const authRegister = require("./routes/authRegister");
const creatPost = require("./routes/createPost");
const creatComment = require("./routes/createComment");
const showPost = require("./routes/showPost");
const showComment = require("./routes/showComment");
const showUser = require("./routes/showUser");
const addFollow = require("./routes/addFollow");
const deletePost = require("./routes/deletePost");

require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(authLogin, authRegister, creatPost, creatComment, showPost, showComment, showUser, addFollow, deletePost);

sequelize
  .sync()
  .then(() => {
    console.log("Modelo sincronizado com o banco de dados.");
  })
  .catch((err) => {
    console.error("Erro ao sincronizar o modelo com o banco de dados: " + err);
  });

UserModel.hasMany(PostModel, { foreignKey: { name: "user_id" } });
UserModel.hasMany(FollowModel, { foreignKey: { name: "user_id" } });

PostModel.belongsTo(UserModel, { foreignKey: { name: "user_id" } });
PostModel.hasMany(CommentModel, { foreignKey: { name: "post_id" } });

CommentModel.belongsTo(UserModel, { foreignKey: "user_id" });
CommentModel.belongsTo(PostModel, { foreignKey: "post_id" });

module.exports = { UserModel, PostModel, CommentModel };
app.listen(process.env.PORT, () => {
  console.log("Servidor Express iniciado na porta 3000.");
});
