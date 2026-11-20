const axios = require('axios');
const FormData = require('form-data');

/**
 * Send WhatsApp message with optional file attachment
 */
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, messageText, authToken, mediaurl } = req.body;
    const uploadFile = req.file; // Uploaded file from multer

    // Validate required fields
    if (!senderId || !receiverId || !messageText || !authToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderId, receiverId, messageText, authToken'
      });
    }

    // Prepare form data for WhatsApp API
    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('messageText', messageText);
    formData.append('authToken', authToken);

    // Add optional fields - only if they have actual values
    if (mediaurl && mediaurl.trim() !== '') {
      formData.append('mediaurl', mediaurl);
    }

    if (uploadFile) {
      formData.append('uploadFile', uploadFile.buffer, {
        filename: uploadFile.originalname,
        contentType: uploadFile.mimetype
      });
    }

    // WhatsApp API endpoint
    const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://api.botmastersender.com/api/v1/?action=send';

    // Send request to WhatsApp API
    const response = await axios.post(whatsappApiUrl, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.response?.data || error.message
    });
  }
};
