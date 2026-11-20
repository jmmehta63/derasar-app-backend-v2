# WhatsApp Integration Setup

## Backend Setup

### Environment Variables
Add the following to your `.env` file in the backend:

```env
WHATSAPP_API_URL=https://api.botmastersender.com/api/v1/?action=send
```

### API Endpoint
- **URL**: `POST /api/whatsapp/send`
- **Content-Type**: `multipart/form-data`

### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| senderId | String | Yes | The WhatsApp number to send from |
| receiverId | String | Yes | The recipient's WhatsApp number |
| messageText | String | Yes | The message content to send |
| authToken | String | Yes | Your authentication token |
| mediaurl | String | No | URL of media to send |
| uploadFile | File | No | File to upload (form-data only) |

### Example Request
```javascript
const formData = new FormData();
formData.append('senderId', '919712017991');
formData.append('receiverId', '919712017991');
formData.append('messageText', 'Hello from Derasar!');
formData.append('authToken', 'your-auth-token');
formData.append('uploadFile', pdfFile);

fetch('http://localhost:5000/api/whatsapp/send', {
  method: 'POST',
  body: formData
});
```

## Frontend Usage

The WhatsApp service is automatically configured to use the backend proxy endpoint.

### Usage in Components
```typescript
import { WhatsAppService } from '../../core/services/whatsapp.service';

constructor(private whatsAppService: WhatsAppService) {}

sendMessage() {
  this.whatsAppService.sendMessageWithFile({
    senderId: '919712017991',
    receiverId: member.phone,
    messageText: 'Your message here',
    authToken: 'your-auth-token',
    uploadFile: pdfFile
  }).subscribe({
    next: (response) => {
      console.log('Message sent successfully:', response);
    },
    error: (error) => {
      console.error('Failed to send message:', error);
    }
  });
}
```

## Configuration in Transaction Component

Update the following values in `transactions.component.ts`:
- `senderId` - Your WhatsApp sender ID (currently hardcoded)
- `authToken` - Your authentication token (currently hardcoded)

**Security Note**: Consider storing these values in the settings service or environment configuration instead of hardcoding them in the component.

## Benefits of Backend Proxy
1. ✅ **No CORS Issues**: Backend handles the external API call
2. ✅ **Security**: Auth tokens not exposed in frontend code
3. ✅ **Error Handling**: Centralized error handling and logging
4. ✅ **Rate Limiting**: Can add rate limiting on the backend
5. ✅ **Monitoring**: Better control over API usage and logging
