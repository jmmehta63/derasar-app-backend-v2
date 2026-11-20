# Jain Derasar Mandvi Backend API

Backend REST API for the Jain Derasar Mandvi System built with Node.js, Express, and MongoDB.

## Features Jain Derasar Mandvi

- 🏛️ Member Management (CRUD operations)
- 💰 Transaction Management (CRUD operations)
- 👥 User Management with authentication
- ⚙️ Settings Management
- 🔐 JWT-based authentication
- 📊 Transaction statistics and reports
- 🔍 Search and filtering
- 📄 Pagination support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: bcryptjs for password hashing

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Steps

1. **Clone the repository**
   ```bash
   cd jain-derasar-mandvi-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jain-derasar-mandvi
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Members
- `GET /api/members` - Get all members (with filtering)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/family/:familyName` - Get members by family name

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/member/:memberId` - Get transactions by member
- `GET /api/transactions/date-range/:startDate/:endDate` - Get transactions by date range
- `GET /api/transactions/stats/summary` - Get transaction statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings

## Query Parameters

### Members Endpoint
```
GET /api/members?search=name&city=સુરત&state=ગુજરાત&isActive=true&page=1&limit=10
```

### Transactions Endpoint
```
GET /api/transactions?search=INV-001&status=Paid&paymentMode=Cash&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=10
```

## Request Examples

### Create Member
```json
POST /api/members
{
  "name": "રામ પટેલ",
  "phone": "૯૮૭૬૫૪૩૨૧૦",
  "address": "મંદિર રોડ",
  "city": "સુરત",
  "state": "ગુજરાત",
  "pincode": "૩૯૪૧૬૦",
  "familyMembers": [
    {
      "name": "સીતા પટેલ",
      "relation": "પત્ની",
      "mobileNumber": "૯૮૭૬૫૪૩૨૧૧"
    }
  ],
  "isActive": true
}
```

### Create Transaction
```json
POST /api/transactions
{
  "memberId": "507f1f77bcf86cd799439011",
  "memberName": "રામ પટેલ",
  "familyName": "પટેલ",
  "category": "Donation",
  "subCategory": "General Donation",
  "totalAmount": 5000,
  "paymentMode": "Cash",
  "status": "Paid",
  "transactionDate": "2025-12-02T10:30:00Z"
}
```

### User Login
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

## Database Schema

### Member Collection
```javascript
{
  name: String (required),
  phone: String (required),
  address: String (required),
  city: String (required),
  state: String (required),
  pincode: String,
  familyMembers: [{
    name: String,
    relation: String,
    mobileNumber: String
  }],
  registrationDate: Date,
  isActive: Boolean,
  createdBy: String,
  updatedBy: String,
  timestamps: true
}
```

### Transaction Collection
```javascript
{
  transactionNumber: String (unique, auto-generated),
  memberId: ObjectId (ref: Member),
  memberName: String (required),
  familyName: String,
  category: String,
  subCategory: String,
  items: [{
    itemName: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  totalAmount: Number (required),
  paymentMode: String (enum),
  transactionReference: String,
  transactionDate: Date,
  status: String (enum),
  createdBy: String,
  updatedBy: String,
  timestamps: true
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Run in production mode
npm start
```

## Security Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` file
2. **Password Hashing**: Passwords are automatically hashed using bcrypt
3. **CORS**: Currently allows all origins - restrict in production
4. **Validation**: All inputs are validated using express-validator

## Connect Frontend

Update your Angular frontend to use this backend:

1. Create an environment file:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

2. Update HTTP calls to use the API endpoints

## License

ISC
