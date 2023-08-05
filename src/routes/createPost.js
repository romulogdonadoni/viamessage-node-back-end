const router = require("./authLogin");
const authToken = require("../config/jwtConfig");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const PostModel = require("../models/postModel");
const imagekit = require("../config/imagekitConfig");
const multer = require("multer");
const multerConfig = require("../config/multerConfig");

router.post("/create/post", multer(multerConfig).single("image"), authToken, async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { id } = jwt.decode(token);
  const { description, privacy } = req.body;
  const base64image = req.file.buffer.toString("base64");
  var metaData;
  try {
    metaData = await imagekit
      .upload({
        file: base64image,
        fileName: "my_file_name.jpg",
      })
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.error("Erro fazer upload da imagem: " + error);
    res.sendStatus(500);
  }
  try {
    const newPost = await PostModel.create({
      id: uuidv4(),
      img: metaData.url,
      description,
      type: metaData.fileType,
      privacy: privacy,
      user_id: id,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Erro ao criar post: " + error);
    res.sendStatus(500);
  }
});

module.exports = router;
