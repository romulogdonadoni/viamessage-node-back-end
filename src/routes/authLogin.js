require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

router.post("/auth/login", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const newUser = await UserModel.findOne({ where: { email: email } });
    console.log(newUser);
    if (password === newUser.password) {
      const token = jwt.sign({ id: newUser.dataValues.id, tagname: newUser.dataValues.tagname }, process.env.JWTSECRET);
      res.status(201).json({
        token: token,
        user: {
          username: newUser.username,
          tagname: newUser.tagname,
          img_profile: newUser.img_profile,
        },
      });
    } else {
      res.status(401).json({ msg: "senha incorreta" });
    }
  } catch (error) {
    console.error("Erro ao logar: " + error);
    res.sendStatus(500);
  }
});

module.exports = router;
