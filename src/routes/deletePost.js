const router = require("./authLogin");
const authToken = require("../config/jwtConfig");
const PostModel = require("../models/postModel");

router.delete("/remove/post/:id", authToken, async (req, res) => {
  const id = req.params["id"];
  try {
    await PostModel.destroy({
      where: { id: id },
    });
    res.status(201).json({msg: "Post deletado com sucesso!"});
  } catch (error) {
    console.error("Erro ao criar post: " + error);
    res.sendStatus(500);
  }
});

module.exports = router;
