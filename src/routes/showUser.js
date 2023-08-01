const UserModel = require("../models/userModel");
const router = require("./authLogin");

router.get("/get/user/:id", async (req, res) => {
  const userid = req.params["id"];
  try {
    const users = await UserModel.findByPk(userid, { attributes: { exclude: ["password"] } });

    res.send(JSON.stringify({ users }));
  } catch (error) {
    console.error("Erro ao buscar os usuários: " + error);
    res.sendStatus(500);
  }
});

module.exports = router