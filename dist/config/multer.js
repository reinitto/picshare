"use strict";

var _checkFileType = _interopRequireDefault(require("../js/checkFileType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const multer = require("multer");

const storage = multer.memoryStorage();
module.exports = {
  storage: storage,
  fileFilter: function (req, file, cb) {
    (0, _checkFileType.default)(file, cb);
  }
};