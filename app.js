const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const path = require("path");
// const fs = require("fs");
// const resizeImg = require("resize-img");
// const sizeOf = require("image-size");
//const keys = require("./config/keys");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
const URL = require("url").URL;
//Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || keys.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY || keys.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET || keys.CLOUD_SECRET
});

const Schema = mongoose.Schema;
//Init Multer Storage
const storage = multer.diskStorage({
  destination: "temp/uploads/original",
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Album schema
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

let Album = mongoose.model("album", AlbumSchema);
//DB
mongoose
  .connect(
    process.env.MONGO_URI || keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Init Upload
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Public Folder
app.use(express.static(path.resolve("./public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  let message = req.query;
  console.log(req.query);
  res.render("index", { message: message });
});
app.post("/update", upload.array("myImage"), async (req, res) => {
  let photos = req.files;
  //getting request url for album name
  const url = new URL(req.headers.referer);
  let re = /%20/g;
  let title = url.pathname.slice(7).replace(re, " ");
  /* we would receive a request of file paths as array */
  let filePaths = photos.map(file => {
    return file.path;
  });
  let multipleUpload = new Promise(async (resolve, reject) => {
    let upload_len = filePaths.length,
      upload_res = new Array();
    for (let i = 0; i <= upload_len + 1; i++) {
      let filePath = filePaths[i];
      await cloudinary.v2.uploader.upload(filePath, (error, result) => {
        if (upload_res.length === upload_len) {
          /* resolve promise after upload is complete */
          resolve(upload_res);
        } else if (result) {
          /*push public_urls in an array */

          upload_res.push(result.url);
        } else if (error) {
          console.log(error);
          reject(error);
        }
      });
    }
  })
    .then(result => result)
    .catch(error => error);
  /*waits until promise is resolved before sending back response to user*/
  let publicUrls = await multipleUpload;
  console.log("publicUrls", publicUrls);
  let urlsForAlbum = publicUrls.map(url => url.slice(49));
  Album.findOneAndUpdate(
    { title: title },
    { $push: { pictures: urlsForAlbum } },
    { new: true },
    (err, album) => {
      if (err) {
        console.log(err);
      } else if (album) {
        let title = album.title;
        let urls = album.pictures;

        //Re-render to see new pics
        res.redirect(`/album/${title}`);
      }
    }
  );
});

app.delete("/album/:albumName", (req, res) => {
  console.log("deleting...");
  let albumName = req.params.albumName;
  console.log(albumName);
  Album.findOneAndDelete({ title: albumName }, function(err, album) {
    if (err) console.log(err);
    if (album) {
    }
    res.sendStatus(200);
  });
});

app.get("/album/:albumName", (req, res) => {
  let albumName = req.params.albumName;
  Album.findOne({ title: albumName }, (err, album) => {
    if (err) {
      console.log(err);
    } else if (album) {
      let title = album.title;
      let urls = album.pictures;

      //Render nano gallery view
      res.render("nanoGalleryAlbum", {
        msg: "Files retrieved from Db",
        title: title,
        nanoGallery: urls
      });
    } else {
      //If album is null redirect back to index page
      res.redirect("/");
    }
  });
});

app.post("/upload", upload.array("myImage"), async (req, res) => {
  let title = req.body.albumName.toString();
  console.log("title:", title);
  //if no album name provided, reload index
  if (!title) {
    res.redirect("/");
  }

  let album = await Album.findOne({ title: title });
  if (album) {
    console.log("Album name taken");
    var message = encodeURIComponent("Album name taken");
    res.redirect("/?message=" + message);
  } else {
    /* receive a request of file paths as array */
    let filePaths = req.files.map(file => {
      return file.path;
    });
    let multipleUpload = new Promise(async (resolve, reject) => {
      let upload_len = filePaths.length,
        upload_res = new Array();
      for (let i = 0; i <= upload_len + 1; i++) {
        let filePath = filePaths[i];
        await cloudinary.v2.uploader.upload(filePath, (error, result) => {
          if (upload_res.length === upload_len) {
            /* resolve promise after upload is complete */
            resolve(upload_res);
          } else if (result) {
            /*push public_urls in an array */

            upload_res.push(result.url);
          } else if (error) {
            console.log(error);
            reject(error);
          }
        });
      }
    })
      .then(result => result)
      .catch(error => error);
    /*waits until promise is resolved before sending back response to user*/
    let publicUrls = await multipleUpload;
    console.log("publicUrls", publicUrls);
    let urlsForAlbum = publicUrls.map(url => url.slice(49));
    Album.create({ title: title, pictures: urlsForAlbum });
    res.redirect(`/album/${title}`);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
