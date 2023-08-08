const authToken = require("../config/jwtConfig");
const PostModel = require("../models/postModel");
const UserModel = require("../models/userModel");
const router = require("./authLogin");
const jwt = require("jsonwebtoken");

router.get("/get/post/:privacy", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const privacy = req.params["privacy"];
  const { id } = jwt.decode(token);

  try {
    const posts = await PostModel.findAll({
      where: { privacy: privacy },
      order: [["createdAt", "DESC"]],
      include: { model: UserModel, attributes: { exclude: ["password"] } },
    });

    res.send(JSON.stringify({ posts }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
module.exports = router;
