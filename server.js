//jshint esversion:6

import labels from "./public/labels.js";

import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import ejs from "ejs";
import fs from "fs";
import gm from "gm";
import path, { dirname } from "path";

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

app.post("/addFace", function (req, res) {
  //create directory
  const name = req.body.nameFace;
  const dirName = "./public/labeled_images/" + name + "/";

  fs.mkdir(dirName, { recursive: true }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Folder created");
    }
  });

  //push added label to database
  var nameExists = 0;

  for (let i = 0; i < labels.length; i++) {
    if (labels[i] === name) {
      nameExists++;
    }
  }

  if (nameExists === 0) {
    labels.push(name);

    const newLabel =
      "const labels = " + JSON.stringify(labels) + "; export default labels;";

    fs.writeFile("./public/labels.js", newLabel, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Name appended");
      }
    });
  } else {
    console.log("name exists");
    res.redirect("/");
  }

  res.redirect("/addFace/upload");
});

app.get("/addFace/upload", function (req, res) {
  res.render("upface");
});

app.post("/addFace/upload", function (req, res) {
  //upload image
  // Set The Storage Engine
  const pathDir = "./public/labeled_images/" + labels[labels.length - 1] + "/";

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./public/labeled_images/" + labels[labels.length - 1] + "/");
    },
    filename: function (req, file, cb) {
      let fileNumber = 1;
      if (fs.existsSync(pathDir + "1" + path.extname(file.originalname))) {
        fileNumber = 2;
      }
      let fileName = fileNumber + path.extname(file.originalname);
      cb(null, fileName);
    },
  });

  // Init Upload
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).fields([
    { name: "myImage1", maxCount: 1 },
    { name: "myImage2", maxCount: 1 },
  ]);

  // Check File Type
  function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpg/;
    // Check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: jpg Only!");
    }
  }
  upload(req, res, (err) => {
    if (err) {
      res.render("upFace", {
        msg: err,
      });
    } else {
      res.redirect("/");
      console.log("Image uploaded");
    }
  });
});

let port = 3000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
