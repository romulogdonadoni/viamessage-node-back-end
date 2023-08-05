const express = require("express");
const FollowModel = require("../models/followModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

router.post("/add/follow/:followtag", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { id: userid } = jwt.decode(token);
  const followtag = req.params["followtag"];

  try {
    const newFollow = await FollowModel.create({
      id: uuidv4(),
      followedUser: followtag,
      user_id: userid,
    });
    res.send(JSON.stringify({ newFollow }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
router.get("/verify/follow/:followtag", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { id: userid } = jwt.decode(token);
  const followtag = req.params["followtag"];

  try {
    const newFollow = await FollowModel.findOne({ where: { user_id: userid, followedUser: followtag } });
    if (newFollow) {
      res.send(JSON.stringify({ liked: "following" }));
    } else {
      res.send(JSON.stringify({ liked: "follow" }));
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
