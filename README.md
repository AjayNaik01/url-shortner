# URL Shortener

A modern, full-stack URL shortening application with user authentication, custom short URLs, QR code generation, and analytics.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **User Authentication**: Register and login to manage your shortened URLs
- **Custom Short URLs**: Create personalized short URLs (for registered users)
- **QR Code Generation**: Download QR codes for your shortened URLs
- **Analytics**: Track clicks and usage statistics for your links
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- React.js
- Tailwind CSS
- Axios for API requests
- React Router for navigation

### Backend

- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

### Clone the repository

```bash
git clone https://github.com/AjayNaik01/url-shortner.git
cd url-shortener
```

### Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file in the BACKEND directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

### Frontend Setup

```bash
cd FRONTEND
npm install
```

Create a `.env` file in the FRONTEND directory with:

```
REACT_APP_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```
