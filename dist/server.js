"use strict";

require("dotenv/config");

var _cloudinary = _interopRequireDefault(require("./config/cloudinary"));

var _Routes = _interopRequireDefault(require("./Routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mongoose = require("mongoose");

const express = require("express");

const path = require("path");

const cloudinary = require("cloudinary");

const bodyParser = require("body-parser"); //Cloudinary config


cloudinary.config(_cloudinary.default); //connect to DB

mongoose.connect(process.env.MONGO_URI || keys.mongoURI, {
  useNewUrlParser: true
}).then(() => console.log("MongoDB Connected")).catch(err => console.log(err)); // Init app

const app = express(); // EJS

app.set("views", path.join(__dirname, "../src/views"));
app.set("view engine", "ejs"); // Public Folder

app.use("/public", express.static(path.join(__dirname, "./public")));
app.use(bodyParser.urlencoded({
  extended: false
})); //Routes

(0, _Routes.default)(app);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));