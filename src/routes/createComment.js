const CommentModel = require("../models/commentModel");
const router = require("./authLogin");
const { v4: uuidv4 } = require("uuid")
const authToken = require("../config/jwtConfig")
const jwt = require("jsonwebtoken");

router.post("/create/comment/:postid", authToken, async (req, res) => {
    const token = req.headers["authorization"].split(" ")[1];
    const { id } = jwt.decode(token);
    const { comment } = req.body;
    const postid = req.params["postid"];
    console.log(jwt.decode(token))

    try {
        const newComment = await CommentModel.create({
            id: uuidv4(),
            comment,
            post_id: postid,
            user_id: id,
        });
        res.status(201).json(newComment);
    } catch (error) {
        console.error("Erro ao criar comentário: " + error);
        res.sendStatus(500);
    }
});
module.exports = router