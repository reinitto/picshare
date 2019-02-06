import "dotenv/config";
import cloudinaryConfig from "./config/cloudinary";
import routes from "./Routes";
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");

//Cloudinary config
cloudinary.config(cloudinaryConfig);

//connect to DB
mongoose
  .connect(process.env.MONGO_URI || keys.mongoURI, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Init app
const app = express();

// EJS
app.set("views", path.join(__dirname, "../src/views"));
app.set("view engine", "ejs");

// Public Folder
app.use("/public", express.static(path.join(__dirname, "./public")));

app.use(bodyParser.urlencoded({ extended: false }));
//Routes
routes(app);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
