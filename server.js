//jshint esversion:6

//Labels is the database
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

//To be able to use the public folder we need to set it to static
app.set("view engine", "ejs");
app.use(express.static("public"));

//Renders the pages from views when requesting GET from the corresponding URL
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/addFace", function (req, res) {
  res.render("addFace");
});
app.get("/addFace/upload", function (req, res) {
  res.render("upface");
});

//Does the following commands when reqesting from POST
app.post("/addFace", function (req, res) {
  //Checks if directory exists and makes if not
  const name = req.body.nameFace;
  const dirName = "./public/labeled_images/" + name + "/";

  fs.mkdir(dirName, { recursive: true }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Folder created");
    }
  });

  //push added label to database if it does not exist yet
  var nameExists = 0;

  for (let i = 0; i < labels.length; i++) {
    if (labels[i] === name) {
      nameExists++;
    }
  }

  //if name doesn't exists then writes then pushes the name and writes it to labels database
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
  }

  //after above code is executed redirects to said page
  res.redirect("/addFace/upload");
});

app.post("/addFace/upload", function (req, res) {
  //upload image
  //set The Storage Engine
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

  //init Upload
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).fields([
    { name: "myImage1", maxCount: 1 },
    { name: "myImage2", maxCount: 1 },
  ]);

  //check File Type
  function checkFileType(file, cb) {
    //allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    //check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    //check mime
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

//hosts the server
let port = 3000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
