const CommentModel = require("../models/commentModel");
const UserModel = require("../models/userModel");
const router = require("./authLogin");

router.get("/post/comment/:id", async (req, res) => {
  const id = req.params["id"];
  console.log(id);

  try {
    const comment = await CommentModel.findAll({
      where: { post_id: id },
      order: [["createdAt", "DESC"]],
      include: {
        model: UserModel,
        attributes: { exclude: ["password", "email"] },
      },
    });

    res.send(JSON.stringify({ comment }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
module.exports = router