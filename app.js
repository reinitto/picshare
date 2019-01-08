const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs");
// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
// + path.extname(file.originalname)
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
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));

const Panel = (choice, ...links) => {
  switch (choice) {
    case 1:
      return `
        <div class="panel-1">
        <div class="panel-1-img" style="background-image:url('${links[0]}')">
        </div>
        </div>`;
    case 2:
      return `
        <div class="panel-2">
          <div class="panel-2-img" style="background-image:url('${links[0]}')">
          </div>
          <div class="panel-2-img" style="background-image:url('${links[1]}')">
          </div>
        </div>`;
    case 3:
      return `
        <div class="panel-3">
        <div class="panel-3-img" style="background-image:url('${links[0]}')">
        </div>
        <div class="panel-3-img" style="background-image:url('${links[1]}')">
        </div>
        <div class="panel-3-img" style="background-image:url('${links[2]}')">
        </div>
        </div>`;
    case 4:
      return `
        <div class="panel-4">
          <div class="p4-padding">
          <div class="panel-4-img " style="background-image:url('${links[0]}')">
          </div>
            </div>
       
            <div class="p4-padding">
        <div class="panel-4-img" style="background-image:url('${links[1]}')">
        </div>
        </div>

        
        <div class="p4-padding">
         <div class="panel-4-img" style="background-image:url('${links[2]}')">
        </div>
        </div>

        
        <div class="p4-padding">
         <div class="panel-4-img" style="background-image:url('${links[3]}')">
        </div>
        </div>
        </div>`;
    case 5:
      return `
        <div class="panel-5">
          <div class='biggerSection'>
          <div class="panel-6-img" style="background-image:url('${links[0]}')">
          </div>
          </div>
          <div class='smallerSection'>
          <div class="smallerSection-img" style="background-image:url('${
            links[1]
          }')">
          </div>
          <div class="smallerSection-img" style="background-image:url('${
            links[2]
          }')">
          </div>
          </div>
         
        </div>`;
    case 6:
      return `
      <div class="panel-6">
     
      <div class='smallerSection'>
      <div class="smallerSection-img" style="background-image:url('${
        links[0]
      }')">
      </div>
      <div class="smallerSection-img" style="background-image:url('${
        links[1]
      }')">
      </div>
      </div>
      <div class='biggerSection'>
      <div class="panel-6-img" style="background-image:url('${links[2]}')">
      </div>
      </div>
    </div>`;
    case 7:
      return `
        <div class="panel-7">
          <div class='biggerSection'>
          <div class="panel-6-img" style="background-image:url('${links[0]}')">
          </div>
          </div>
          <div class='smallerSection'>
          <div class="smallerSection-img" style="background-image:url('${
            links[1]
          }')">
          </div>
          <div class="smallerSection-img" style="background-image:url('${
            links[2]
          }')">
          </div>
          
          <div class="smallerSection-img" style="background-image:url('${
            links[3]
          }')">
          </div>
          </div>
          </div>`;
    default:
      break;
  }
};

async function getDiff(img1, img2) {
  const options = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true
    },
    scaleToSameSize: true,
    ignore: "antialiasing"
  };

  // The parameters can be Node Buffers
  // data is the same as usual with an additional getBuffer() function
  const data = await compareImages(
    await fs.readFile("public/uploads/" + img1.filename),
    await fs.readFile("public/uploads/" + img2.filename),
    options
  );
  await fs.writeFile("./output.png", data.getBuffer());
}

app.post("/upload", upload.array("myImage"), function(req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  let files = req.files;
  // files.forEach(file => {
  //   for (let i = 0; i < files.length; i++) {
  //     getDiff(file, files[i]);
  //   }
  // });
  let result = [];
  for (let i = 0; i < files.length; i++) {
    console.log("filename: ", files[i].filename);
    // If last 1-3 pics use 3rd panel and end loop
    if (files.length <= i + 3) {
      let panel;
      switch (files.length - (i + 3)) {
        case 0:
          panel = Panel(
            4,
            "uploads/" + files[i].filename,
            "uploads/" + files[i + 1].filename,
            "uploads/" + files[i + 2].filename
          );
          i = i + 3;
          break;
        case -1:
          panel = Panel(
            3,
            "uploads/" + files[i].filename,
            "uploads/" + files[i + 1].filenam
          );
          i = i + 2;
          break;
        case -2:
          panel = Panel(2, "uploads/" + files[i].filename);
          break;
      }
      result.push(panel);
    } else {
      let choice = Math.floor(Math.random() * 7 + 1);
      if (files[i].size <= 50000) choice = Math.floor(Math.random() * 7 + 2);
      let panel = "Panel(";
      panel += choice + ", ";
      let picCount;
      switch (choice) {
        case 1:
          picCount = 1;
          break;
        case 2:
          picCount = 2;
          break;
        case 3:
          picCount = 3;
          break;
        case 4:
          picCount = 4;
          break;
        case 5:
          picCount = 3;
          break;
        case 6:
          picCount = 3;
          break;
        case 7:
          picCount = 4;
          break;
        default:
          break;
      }
      for (let j = 0; j < picCount; j++) {
        panel += '"';
        panel += "uploads/" + files[i + j].filename;
        panel += '"';
        if (j < picCount - 1) {
          panel += ",";
        }
      }
      panel += ")";
      switch (choice) {
        case 2:
          i = i + 1;
          break;
        case 3:
          i = i + 2;
          break;
        case 4:
          i = i + 3;
          break;
        case 5:
          i = i + 2;
          break;
        case 6:
          i = i + 2;
          break;
        case 7:
          i = i + 3;
          break;
        default:
          break;
      }
      console.log("panel:", panel);
      let res = eval(panel);
      result.push(res);
    }
  }
  res.render("album", {
    msg: "Files Uploaded!",
    files: result
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
