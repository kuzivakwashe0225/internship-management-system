const multer = require('multer');
const path = require('path');

// Storage strategy for CVs
const cvStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/cvs/')
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname))
    }
});
exports.uploadCV = multer({ storage: cvStorage, limits: { fileSize: 5000000 } }); // 5MB limit

// Storage strategy for Task submissions (e.g. HIT-300 files)
const taskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tasks/')
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + req.params.id + '-' + Date.now() + path.extname(file.originalname))
    }
});
exports.uploadTaskFile = multer({ storage: taskStorage, limits: { fileSize: 10000000 } }); // 10MB limit
