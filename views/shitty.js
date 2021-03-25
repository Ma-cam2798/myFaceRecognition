//upload image
// Set The Storage Engine
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
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("myImage");

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

upload(req, res, (err) => {
  if (err) {
    res.render("addFace", {
      msg: err,
    });
  } else {
    if (req.file == undefined) {
      res.render("addFace", {
        msg: "Error: No File Selected!",
      });
    } else {
      res.render("addFace", {
        msg: "File Uploaded!",
        file: `uploads/${req.file.filename}`,
      });
    }
  }
});
console.log("bitch uploaded");
