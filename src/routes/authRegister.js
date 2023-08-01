const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid")
const UserModel = require('../models/userModel');

router.post("/auth/register", async (req, res) => {
    console.log(req.body);
    try {
        const { username, tagname, email, password } = req.body;
        if (password.length < 8) {
            return;
        }
        const newUser = await UserModel.create({
            id: uuidv4(),
            tagname,
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