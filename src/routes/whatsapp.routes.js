const express = require('express');
const router = express.Router();
const multer = require('multer');
const whatsappController = require('../controllers/whatsapp.controller');

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/whatsapp/send
 * Send WhatsApp message with optional file attachment
 */
router.post('/send', upload.single('uploadFile'), whatsappController.sendMessage);

module.exports = router;
