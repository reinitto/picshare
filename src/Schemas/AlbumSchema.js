import mongoose from "mongoose";
const Schema = mongoose.Schema;

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
});
// Album schema
module.exports = AlbumSchema;
