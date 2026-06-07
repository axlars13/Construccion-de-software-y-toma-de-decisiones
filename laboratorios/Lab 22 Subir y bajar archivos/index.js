const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4001;
const log = console.log;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const controller = require("./index.controller");
app.post("/upload_file", controller.upload_file);
app.post("/upload_file_private", controller.upload_file_private);
app.get("/get_private_file/:file", controller.get_private_file);

app.listen(port, ()=>{
    log("Node.js server running on port " + port);
});