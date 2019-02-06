import checkFileType from "../js/checkFileType";
const multer = require("multer");
const storage = multer.memoryStorage();
module.exports = {
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
};
