const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const UserModel = require("../models/userModel");

const imagekit = require("../config/imagekitConfig");
const multer = require("multer");
const multerConfig = require("../config/multerConfig");

router.post("/auth/register", multer(multerConfig).single("img_profile"), async (req, res) => {
  console.log(req.body);
  const base64image = req.file.buffer.toString("base64");
  var metaData;
  try {
    metaData = await imagekit
      .upload({
        file: base64image,
        fileName: "profile_img",
        folder: "ProfileImages",
        transformation: [
          {
            width: 256,
            height: 256,
            crop: "force",
            quality: 90
          }
        ]
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
    const { username, tagname, email, password } = req.body;
    if (password.length < 8) {
      return;
    }
    const newUser = await UserModel.create({
      id: uuidv4(),
      tagname,
      img_profile: metaData.url,
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

module.exports = router;
