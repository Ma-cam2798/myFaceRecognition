//jshint esversion:6

import labels from "./public/labels.js";

import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import ejs from "ejs";
import fs from "fs";
import path from "path";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/addFace", function (req, res) {
  res.render("addFace");
});

var dirName;

app.post("/addFace", function (req, res) {
  //create directory
  const name = req.body.nameFace;
  dirName = "./public/labeled_images/" + name + "/";

  fs.mkdir(dirName, { recursive: true }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("bitch is created");
    }
  });

  //push added label to database
  labels.push(name);

  const newLabel =
    "const labels = " + JSON.stringify(labels) + "; export default labels;";

  fs.writeFile("./public/labels.js", newLabel, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("bitch is appended");
    }
  });
  res.redirect("/addFace/upload");
});

app.get("/addFace/upload", function (req, res) {
  res.render("upface");
  console.log(dirName);
});

app.post("/addFace/upload", function (req, res) {
  //upload image
  // Set The Storage Engine
  console.log(dirName);

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, dirName);
    },
    filename: function (req, file, cb) {
      let fileName =
        file.fieldname + "-" + Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    },
  });

  // Init Upload
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).single("myImage");

  // Check File Type
  function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  }
  upload(req, res, (err) => {
    if (err) {
      res.render("upFace", {
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.render("upFace", {
          msg: "Error: No File Selected!",
        });
      } else {
        res.render("upFace", {
          msg: "File Uploaded!",
          file: `uploads/${req.file.filename}`,
        });
      }
    }
  });
  console.log("bitch uploaded");
});

let port = 3000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
