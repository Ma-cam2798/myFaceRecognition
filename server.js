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

app.post("/addFace", function (req, res) {
  //create directory
  const name = req.body.nameFace;
  const dirName = "./public/labeled_images/test" + name;

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

  //upload image
  
  res.redirect("/");
});

let port = 3000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
