const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const path = require("path");
//const keys = require("./config/keys");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
const URL = require("url").URL;
//Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = multer.memoryStorage();
// Init Upload
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

const Schema = mongoose.Schema;

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

const Album = mongoose.model("album", AlbumSchema);
//DB
mongoose
  .connect(
    process.env.MONGO_URI || keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Public Folder
app.use(express.static(path.resolve("./public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  let message = req.query;
  res.render("index", { message: message });
});
app.post("/update", upload.array("myImage"), async (req, res) => {
  try {
    let pictures = req.files;
    //getting request url for album name
    const url = new URL(req.headers.referer);
    let title = decodeURIComponent(url.pathname).slice(7);

    /* we would receive a request of file paths as array */
    if (pictures.length == 0) {
      console.log("No pictures selected");
      var message = encodeURIComponent(
        "No pictures selected, please add more photos before updating gallery"
      );
      res.redirect(`${url}/?message=${message}`);
      return;
    }

    let fileBuffers = req.files.map(file => {
      return file.buffer;
    });
    //Array of promises with pic urls
    let fileUrls = fileBuffers.map(async file => {
      return new Promise(async (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(async result => {
            let url = await result.url;
            resolve(url);
          })
          .end(file);
      });
    });

    //waits until promise is resolved before updating album
    Promise.all(fileUrls).then(urls => {
      Album.findOneAndUpdate(
        { title: title },
        { $push: { pictures: urls } },
        { new: true },
        (err, album) => {
          if (err) {
            console.log(err);
          } else if (album) {
            console.log("album found and updated");
            let title = album.title;
            //Re-render to see new pics
            res.redirect(`/album/${title}`);
          }
        }
      );
    });
  } catch (err) {
    console.log("Error caught", err);
  }
});

app.delete("/album/:albumName", (req, res) => {
  console.log("deleting...");
  let albumName = req.params.albumName;

  console.log("deleting album named:", albumName);
  Album.findOneAndDelete({ title: albumName }, function(err, album) {
    if (err) console.log("error finding and deleting album", err);
    if (album) {
    }
    res.sendStatus(200);
  });
});

app.get("/album/:albumName", (req, res) => {
  let albumName = req.params.albumName;
  let message = req.query.message;
  Album.findOne({ title: albumName }, (err, album) => {
    if (err) {
      console.log("error finding album: ", err);
    } else if (album) {
      let title = album.title;
      let urls = album.pictures;

      //Render nano gallery view
      res.render("nanoGalleryAlbum", {
        message: message,
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
  try {
    let title = req.body.albumName.toString();
    let pictures = req.files;
    //if no album name provided, redirect to homepage with a message
    if (!title) {
      console.log("No title given");
      var message = encodeURIComponent("No title given");
      res.redirect("/?message=" + message);
      return;
    }
    //If no pictures selected, redirect to homepage with a message
    if (pictures.length == 0) {
      console.log("No pictures selected");
      var message = encodeURIComponent(
        "No pictures selected, please add photos before creating a gallery"
      );
      res.redirect("/?message=" + message);
      return;
    }
    //Find album name in collection
    let album = await Album.findOne({ title: title }).catch(err =>
      console.log("caught error in finding album:", err)
    );
    if (album) {
      //If album name already exists, redirect to homepage with a message
      console.log("Album name taken");
      var message = encodeURIComponent("Album name taken");
      res.redirect("/?message=" + message);
    } else if (album === null) {
      //If album name not taken
      console.log("Name available");
      //file buffer array
      let fileBuffers = req.files.map(file => {
        return file.buffer;
      });
      //Array of promises with pic urls
      let fileUrls = fileBuffers.map(async file => {
        return new Promise(async (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(async result => {
              let url = await result.url;
              resolve(url);
            })
            .end(file);
        });
      });

      //waits until promise is resolved before creating album
      Promise.all(fileUrls).then(urls => {
        Album.create({ title: title, pictures: urls }, function(err, album) {
          if (err) console.log("error creating album", err);
          console.log("redirecting to album");
          res.redirect(`/album/${title}`);
        });
      });
    }
  } catch (err) {
    console.log("error cought:", err);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
