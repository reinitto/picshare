const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const resizeImg = require("resize-img");
//const keys = require("./config/keys");
const Schema = mongoose.Schema;
//Init Multer Storage
const storage = multer.diskStorage({
  destination: "./uploads/original",
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
  subtitle: {
    type: String
  },
  pictures: [Schema.Types.ObjectId],
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
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));

app.get("/album/:albumName", async (req, res) => {
  removeOldUploads("/uploads/small");
  let albumName = req.params.albumName;
  Album.findOne({ title: albumName }, async (err, album) => {
    if (err) console.log(err);
    else {
      let panels, title, subtitle;
      let pictures;
      if (album) {
        if (album.title) title = album.title;
        if (album.subtitle) subtitle = album.subtitle;
        if (album.pictures != null) {
          pictures = await getPictures(album);
        }
        if (pictures.images != null) {
          panels = await createPanels(pictures.images);
        }
      }

      //create panels from all pics
      await res.render("album", {
        msg: "Files retrieved from Db",
        files: panels,
        title: title,
        subtitle: subtitle,
        album: album,
        comments: JSON.stringify(pictures.comments)
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

function resizeImages(array) {
  let resizedImages = [];
  array.forEach(file => {
    resizeImg(fs.readFileSync(file.path), {
      width: 512,
      height: 512
    }).then(buf => {
      fs.writeFileSync(
        __dirname + `/public/uploads/small/${file.originalname}`,
        buf
      );
      // encode the file as a base64 string.
      let newPic = new Image({
        name: file.originalname,
        data: fs.readFileSync(
          __dirname + `/public/uploads/small/${file.originalname}`
        ),
        type: file.contentType,
        comments: []
      });
      resizedImages.push(newPic);
    });
  });
  return resizedImages;
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
app.post("/upload", upload.array("myImage"), function(req, res, next) {
  removeOldUploads(__dirname + "/public/uploads/small");
  removeOldUploads(__dirname + "/public/uploads/original");
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any

  let photos = req.files;
  let { albumName: title, subtitle } = req.body;
  let resizedImages = resizeImages(photos);

  //save files to mongoDB
  var query = Album.where({ title: title });
  query.findOne(function(err, album) {
    if (err) return console.log(err);
    if (album) {
      console.log("found album");
      if (album == null) {
        console.log("album is null");
      }
      // doc may be null if no document matched
    } else {
      Image.insertMany(resizedImages).then(imgArray => {
        console.log("imgArray:", imgArray);
        let imgIds = [];
        imgArray.forEach(img => {
          imgIds.push(img._id);
        });
        console.log("imgIds", imgIds);
        query.findOneAndUpdate(
          { title: title },
          { title: title, subtitle: subtitle, pictures: imgIds },
          { upsert: true, new: true },
          function(err, album) {
            if (err) console.log(err);
            else {
              console.log("this is the album", album);
              res.redirect(`/album/${title}`);
              res.send(200);
            }
          }
        );
      });
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
