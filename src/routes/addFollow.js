const express = require('express');
const FollowModel = require('../models/followModel');
const router = express.Router();
const { v4: uuidv4 } = require("uuid")

router.post("/add/follow/:userid/:followtag", async (req, res) => {
  const userid = req.params["userid"];
  const followtag = req.params["followtag"];

  try {
    const newFollow = await FollowModel.create({
      id: uuidv4(),
      followedUser: followtag,
      user_id: userid,
    })
    res.send(JSON.stringify({ newFollow }));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
module.exports = router