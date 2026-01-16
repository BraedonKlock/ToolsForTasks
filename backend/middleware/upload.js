const multer = require('multer');
const path = require('path');

// Configure storage for employee images
const employeeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/employees'));
    },
    filename: (req, file, cb) => {
        // Create unique filename: orgId-timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `employee-${uniqueSuffix}${ext}`);
    }
});

// File filter to only allow images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
};

// Multer instance for employee uploads
const uploadEmployeeImage = multer({
    storage: employeeStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFilter
});

// Configure storage for job images
const jobStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/jobs'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `job-${uniqueSuffix}${ext}`);
    }
});

// Multer instance for job uploads
const uploadJobImage = multer({
    storage: jobStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFilter
});

module.exports = {
    uploadEmployeeImage,
    uploadJobImage
};
