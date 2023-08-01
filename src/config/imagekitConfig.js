const ImageKit = require("imagekit");
require("dotenv").config();

const imagekit = new ImageKit({
    publicKey: process.env.IMGKT_PUBLIC_KEY,
    privateKey: process.env.IMGKT_PRIVATE_KEY,
    urlEndpoint: process.env.IMGKT_URL_ENDPOINT,
});

module.exports = imagekit