const express = require('express');
const router = express.Router();
const UserModel = require("../models/userModel");
const FollowModel = require('../models/followModel');

router.get("/get/user/:tag", async (req, res) => {
  const tag = req.params["tag"];
  try {
    const users = await UserModel.findOne({
      where: { tagname: tag },
      attributes: { exclude: ["password"] },
      include: {
        model: FollowModel,
        attributes: {
          exclude: ["id", "user_id"]
        }
      }
    }
    );

    res.json({ users: [users] });
  } catch (error) {
    console.error("Erro ao buscar os usuários: " + error);
    res.sendStatus(500);
  }
});
router.get("/get/user", async (req, res) => {
  try {
    const users = await UserModel.findAll({ attributes: { exclude: ["password"] } });

    res.send(JSON.stringify({ users }));
  } catch (error) {
    console.error("Erro ao buscar os usuários: " + error);
    res.sendStatus(500);
  }
});


module.exports = router