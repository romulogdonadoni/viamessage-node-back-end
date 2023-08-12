const router = require("./authLogin");
const authToken = require("../config/jwtConfig");
const PostModel = require("../models/postModel");
const jwt = require("jsonwebtoken");

router.delete("/remove/post/:id", authToken, async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { user_id } = jwt.decode(token);
  const id = req.params["id"];
  try {
    await PostModel.destroy({
      where: { id: id, user_id },
    });
    res.status(201).json({ msg: "Post deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar post: " + error);
    res.sendStatus(500);
  }
});

module.exports = router;
