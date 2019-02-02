const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const resizeImg = require("resize-img");
const sizeOf = require("image-size");
//const keys = require("./config/keys");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
//Cloudinary config
cloudinary.config({
  cloud_name: process.env.cloud_name || keys.CLOUD_NAME,
  api_key: process.env.api_key || keys.CLOUD_KEY,
  api_secret: process.env.api_secret || keys.CLOUD_SECRET
});

const Schema = mongoose.Schema;
//Init Multer Storage
const storage = multer.diskStorage({
  destination: "temp/uploads/original",
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

//Image Schema
const ImageSchema = new Schema({
  type: String,
  data: Buffer,
  comments: [
    {
      text: {
        type: String
      },
      name: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
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
let Image = mongoose.model("images", ImageSchema);
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

async function getPictures(album) {
  let images = [];
  let comments = [];
  for (const pic of album.pictures) {
    await Image.findOne({ _id: pic }, async (err, picture) => {
      if (err) console.log(err);
      else if (picture != null) {
        images.push({
          image: `data:image/jpeg;base64,${picture.data.toString("base64")}`,
          id: picture._id
        });
        comments.push({
          picId: picture._id,
          comments: picture.comments
        });
      } else {
        console.log(`picture with the id ${pic} not found`);
      }
    });
  }
  let panels = createPanels(await images);

  return {
    images,
    comments,
    panels
  };
}

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Public Folder
app.use(express.static(path.resolve("./public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => res.render("index"));

app.get("/album/:albumName", (req, res) => {
  let albumName = req.params.albumName;
  Album.findOne({ title: albumName }, (err, album) => {
    if (err) console.log(err);
    else {
      let title = album.title;
      let urls = album.pictures;

      //create panels from all pics
      res.render("nanoGalleryAlbum", {
        msg: "Files retrieved from Db",
        title: title,
        nanoGallery: urls
      });
    }
  });
});

function panelPicker(maxNum) {
  return Math.floor(Math.random() * maxNum + 1);
}

function createPanels(links, allPanels) {
  allPanels ? (allPanels = allPanels) : (allPanels = []);
  if (links.length == 0) {
    return allPanels;
  } else {
    let choice = panelPicker(7);
    if (choice > links.length) {
      choice = panelPicker(links.length);
    }
    switch (choice) {
      case 1:
        allPanels.push(`
        <div class="panel-1">
        <div class="panel-1-img" id=${
          links[0].id
        }  style="background-image:url('${links[0].image}')" 
         >
        </div>
        
      </div>`);
        links = links.slice(1);
        return createPanels(links, allPanels);

      case 2:
        allPanels.push(`
          <div class="panel-2">
            <div class="panel-2-img" id=${
              links[0].id
            } style="background-image:url('${links[0].image}')">
            </div>
            <div class="panel-2-img"  id=${
              links[1].id
            } style="background-image:url('${links[1].image}')">
            </div>
          </div>`);
        links = links.slice(2);
        return createPanels(links, allPanels);

      case 3:
        allPanels.push(`
          <div class="panel-3">
          <div class="panel-3-img"id=${
            links[0].id
          } style="background-image:url('${links[0].image}')">
          </div>
          <div class="panel-3-img" id=${
            links[1].id
          } style="background-image:url('${links[1].image}')">
          </div>
          <div class="panel-3-img" id=${
            links[2].id
          } style="background-image:url('${links[2].image}')">
          </div>
          </div>`);

        links = links.slice(3);
        return createPanels(links, allPanels);

      case 4:
        allPanels.push(`
          <div class="panel-4">
            <div class="p4-padding">
            <div class="panel-4-img "  id=${
              links[0].id
            } style="background-image:url('${links[0].image}')">
            </div>
              </div>

              <div class="p4-padding">
          <div class="panel-4-img"  id=${
            links[1].id
          } style="background-image:url('${links[1].image}')">
          </div>
          </div>

          <div class="p4-padding">
           <div class="panel-4-img"   id=${
             links[2].id
           } style="background-image:url('${links[2].image}')">
          </div>
          </div>

          <div class="p4-padding">
           <div class="panel-4-img" id=${
             links[3].id
           } style="background-image:url('${links[3].image}')">
          </div>
          </div>
          </div>`);
        links = links.slice(4);
        return createPanels(links, allPanels);
      case 5:
        allPanels.push(`
          <div class="panel-5">
            <div class='biggerSection'>
            <div class="panel-6-img" id=${
              links[0].id
            } style="background-image:url('${links[0].image}')">
            </div>
            </div>
            <div class='smallerSection'>
            <div class="smallerSection-img"  id=${
              links[1].id
            } style="background-image:url('${links[1].image}')">
            </div>
            <div class="smallerSection-img" id=${
              links[2].id
            } style="background-image:url('${links[2].image}')">
            </div>
            </div>

          </div>`);
        links = links.slice(3);
        return createPanels(links, allPanels);
      case 6:
        allPanels.push(`
        <div class="panel-6">

        <div class='smallerSection'>
        <div class="smallerSection-img"  id=${
          links[0].id
        } style="background-image:url('${links[0].image}')">
        </div>
        <div class="smallerSection-img"  id=${
          links[1].id
        } style="background-image:url('${links[1].image}')">
        </div>
        </div>
        <div class='biggerSection'>
        <div class="panel-6-img" id=${
          links[2].id
        } style="background-image:url('${links[2].image}')">
        </div>
        </div>
      </div>`);
        links = links.slice(3);
        return createPanels(links, allPanels);
      case 7:
        allPanels.push(`
          <div class="panel-7">
            <div class='biggerSection'>
            <div class="panel-6-img"  id=${
              links[0].id
            } style="background-image:url('${links[0].image}')">
            </div>
            </div>
            <div class='smallerSection'>
            <div class="smallerSection-img" id=${
              links[1].id
            } style="background-image:url('${links[1].image}')">
            </div>
            <div class="smallerSection-img" id=${
              links[2].id
            } style="background-image:url('${links[2].image}')">
            </div>

            <div class="smallerSection-img" id=${
              links[3].id
            } style="background-image:url('${links[3].image}')">
            </div>
            </div>
            </div>`);
        links = links.slice(4);
        return createPanels(links, allPanels);
      default:
        return;
    }
  }
}

function getDimensions(file) {
  return new Promise((resolve, reject) => {
    let dimensions = sizeOf(file.path);
    let newFile = { ...file, dimensions };
    resolve(newFile);
  });
}

function resize(file) {
  if (file.dimensions.width >= file.dimensions.height) {
    return new Promise((resolve, reject) => {
      resolve(
        resizeImg(fs.readFileSync(file.path), {
          width: 900,
          height: 600
        })
      );
    });
  } else {
    return new Promise((resolve, reject) => {
      resolve(
        resizeImg(fs.readFileSync(file.path), {
          width: 600,
          height: 900
        })
      );
    });
  }
}

function saveImage(buf, file) {
  let newPic = {
    name: file.originalname,
    data: buf,
    type: file.contentType,
    comments: []
  };
  return new Promise((resolve, reject) => {
    Image.create(newPic)
      .then(data => {
        resolve(data._id);
      })
      .catch(err => reject(err));
  });
}

function saveImgtoDb(file) {
  return getDimensions(file)
    .then(file => resize(file))
    .then(buf => saveImage(buf, file));
}

function resizeImages(array) {
  let ids = [];
  for (let i = 0; i < array.length; i++) {
    ids.push(
      new Promise((resolve, reject) => {
        resolve(saveImgtoDb(array[i]));
      })
    );
    console.log("ids", ids);
  }
  return ids;
}
function removeOldUploads(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}

app.get("/comment/:album/:picId/:name/:text", (req, res) => {
  console.log("req.query: ", req.query);
  let comment = {
    name: req.query.name,
    text: req.query.comment,
    date: req.query.date || Date.now()
  };
  Image.findOneAndUpdate(
    { _id: req.query.id },
    { $push: { comments: comment } },
    { new: true },
    (err, res) => {
      if (err) console.log(err);
      else {
        console.log("Updated to this: ", res);
      }
    }
  );
  res.send(200);
});
app.post("/upload", upload.array("myImage"), async (req, res) => {
  let title = req.body.albumName.toString();
  console.log("title:", title);
  /* we would receive a request of file paths as array */
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
  let nanoGallery = publicUrls.map(url => {
    return {
      src: url.slice(49)
    };
  });
  console.log("ng", nanoGallery);
  let urlsForAlbum = publicUrls.map(url => url.slice(49));

  Album.create({ title: title, pictures: urlsForAlbum });
  res.redirect(`/album/${title}`);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
