# University Admin Panel

A comprehensive web application for university administration that manages student records, admin profiles, and provides a user-friendly dashboard for educational institution management.

## Features

- **Authentication System**
  - Login/Register functionality
  - Role-based access control (Admin/Student)
  - Password reset functionality
  - JWT-based authentication

- **Admin Dashboard**
  - Overview of university statistics
  - Student management (add, edit, delete)
  - Admin profile management

- **Student Portal**
  - Student profile view and management
  - Personal information management

- **Security Features**
  - Password encryption
  - Protected routes
  - Input validation
  - Error handling

## Tech Stack

### Backend
- **Node.js** with **Express** - Server framework
- **TypeScript** - Type safety and enhanced developer experience
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation
- **Multer** - File uploads
- **Nodemailer** - Email functionality
- **Swagger** - API documentation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching and state management
- **Material UI** - Component library
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Zod** - Schema validation

## Project Structure

```
university-admin-panel/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── app.ts           # Express application setup
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Validation schemas
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                # Frontend React application
    ├── public/              # Static files
    ├── src/
    │   ├── assets/          # Images, fonts, etc.
    │   ├── components/      # Reusable components
    │   ├── contexts/        # React contexts
    │   ├── lib/             # Utility functions
    │   ├── pages/           # Page components
    │   ├── App.tsx          # Main application component
    │   └── main.tsx         # Application entry point
    ├── package.json
    └── vite.config.ts
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/university-admin
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

4. Build the application:
   ```
   npm run build
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

### API Documentation
Once the backend server is running, you can access the Swagger API documentation at:
```
http://localhost:5000/api-docs
```

### Available Scripts

#### Backend
- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

#### Frontend
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
