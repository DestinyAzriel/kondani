const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a simple Express app to test the multer configuration
const app = express();

// Configure multer exactly as in the real application
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Setting destination folder');
        cb(null, 'uploads/id-documents/');
    },
    filename: (req, file, cb) => {
        console.log('Generating filename');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = 'id-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', fileName);
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        console.log('Filtering file:', file.originalname);
        console.log('MIME type:', file.mimetype);
        
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            console.log('File accepted');
            return cb(null, true);
        } else {
            console.log('File rejected - invalid type');
            cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
        }
    }
});

// Test endpoint
app.post('/test-upload', upload.single('document'), (req, res) => {
    console.log('Upload middleware completed');
    
    if (!req.file) {
        console.log('No file received');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File received:', req.file);
    res.json({ 
        message: 'File uploaded successfully',
        file: req.file
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.log('Error occurred:', error.message);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    res.status(400).json({ error: error.message });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
    console.log('To test, run this command in another terminal:');
    console.log(`curl -X POST http://localhost:${PORT}/test-upload -F "document=@path/to/your/image.jpg"`);
});