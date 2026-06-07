const log = console.log;
const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, callback){
        log("File destination:", "./public");
        callback(null, "./public");
    },
    filename: function (req, file, callback){
        //log("Uploaded file: ", file)
        callback(null, file.originalname);
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //callback(null, file.fieldname + '-' + uniqueSuffix + ".pdf");
    }
});

//const upload = multer({storage: storage}).single("file");
const upload = multer({storage: storage}).array("file",2);

const storage2 = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, "./private");
    },
    filename: function (req, file, callback){
        return callback(null, file.originalname);
    }
});

const upload2 = multer({storage: storage2}).array("file",2);

module.exports.upload_file = (req, res) => {
    upload(req,res, function(err) {
        if(err){
            console.error(err);
            return res.status(500).json({code: 500, msg:"Error uploading file"});
        }

        log("File uploaded successfully", req.files);
        res.status(200).json({code: 200, msg:"File uploaded successfully"});
    });
};

module.exports.upload_file_private = (req, res) => {
    upload2(req,res, function(err) {
        if(err){
            console.error(err);
            return res.status(500).json({code: 500, msg:"Error uploading file"});
        }

        log("File uploaded successfully", req.files);
        res.status(200).json({code: 200, msg:"File uploaded successfully"});
    });
};

module.exports.get_private_file = async (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, "./private", fileName);

    res.sendFile(filePath, (err) => {
        if(err){
            console.error(err);
            return res.status(404).json({code: 404, msg:"File not found"});
        }
    });
};