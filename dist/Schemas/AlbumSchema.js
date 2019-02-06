"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const AlbumSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  pictures: [String],
  date: {
    type: Date,
    default: Date.now
  }
}); // Album schema

module.exports = AlbumSchema;