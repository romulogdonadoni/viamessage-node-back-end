const multer = require("multer");

const multerMemoryStorage = multer.memoryStorage();

const multerConfig = {
    storage: multerMemoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
module.exports = multerConfig