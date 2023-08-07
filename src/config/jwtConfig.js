require("dotenv").config();
const jwt = require("jsonwebtoken");

function authToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401);
    }

    try {
        jwt.verify(token, process.env.JWTSECRET);
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token inválido" });
    }
}
module.exports = authToken