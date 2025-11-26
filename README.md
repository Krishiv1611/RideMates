# RideMates

RideMates is a full-stack ride-sharing application that connects drivers with passengers. It facilitates ride creation, booking, and real-time communication between users.

## Features

- **User Authentication**: Secure signup and signin using JWT and Google Authentication.
- **Ride Management**:
  - Create rides with details like source, destination, date, time, and price.
  - Search and book available rides.
  - Manage booking requests (accept/reject).
- **Real-time Chat**: Integrated chat functionality using Socket.io for communication between drivers and passengers.
- **Dashboard**: View created rides, booked rides, and manage passengers.
- **Responsive Design**: Built with React and Tailwind CSS for a seamless mobile and desktop experience.

## Tech Stack

### Frontend
- **React**: UI library.
- **Vite**: Build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Router**: Client-side routing.
- **Socket.io Client**: Real-time bidirectional event-based communication.
- **Axios**: Promise based HTTP client.

### Backend
- **Node.js & Express**: Server-side runtime and framework.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **Socket.io**: Real-time engine.
- **JWT**: JSON Web Tokens for authentication.
- **Zod**: Schema validation.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

## Project Structure & File Usage

This section provides a detailed overview of the project's folder structure and the purpose of key files.

### Backend (`/backend`)

The backend is built with Node.js, Express, and MongoDB.

```
backend/
├── controllers/       # Logic for handling API requests
├── middlewares/       # Custom middleware (e.g., auth checks)
├── models/            # Mongoose schemas for database collections
│   ├── Message.js     # Chat message schema
│   ├── Reservation.js # Ride booking reservation schema
│   ├── Ride.js        # Ride details schema
│   └── User.js        # User profile and auth schema
├── routes/            # API route definitions
│   ├── chat.js        # Chat-related routes
│   ├── reservation.js # Booking management routes
│   ├── rides.js       # Ride creation and retrieval routes
│   └── user.js        # Authentication routes
├── database.js        # MongoDB connection setup
├── index.js           # Application entry point (Server & Socket.io setup)
└── .env               # Environment variables (PORT, MONGO_URL, etc.)
```

### Frontend (`/frontend`)

The frontend is a React application built with Vite and Tailwind CSS.

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable React components and pages
│   │   ├── BookRide.jsx        # Page to search and book rides
│   │   ├── Chat.jsx            # Real-time chat interface
│   │   ├── CreateRide.jsx      # Form to publish a new ride
│   │   ├── FooterNav.jsx       # Mobile-responsive navigation bar
│   │   ├── GoogleSignInButton.jsx # Google Auth component
│   │   ├── Inbox.jsx           # List of active chat conversations
│   │   ├── ManageRequests.jsx  # Driver's view to accept/reject bookings
│   │   ├── MyBookings.jsx      # List of rides booked by the user
│   │   ├── MyCreated.jsx       # List of rides created by the user
│   │   ├── Signin.jsx          # User login page
│   │   ├── Signup.jsx          # User registration page
│   │   └── ViewPassengers.jsx  # View passenger details for a ride
│   ├── App.jsx        # Main application component with Routing
│   ├── index.css      # Global styles and Tailwind directives
│   └── main.jsx       # React DOM entry point
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
└── vite.config.js     # Vite configuration
```

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RideMates
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/ridemates
JWT_SECRET=your_jwt_secret_key
FRONT_END=http://localhost:5173
```

Start the backend server:

```bash
npm start
# OR for development with nodemon
npm run dev
```

The server will start on `http://localhost:3000`.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Endpoints

### Users
- `POST /users/signup`: Register a new user.
- `POST /users/signin`: Authenticate a user.

### Rides
- `POST /rides/create`: Create a new ride.
- `GET /rides/all`: Get all available rides.
- `GET /rides/my-created-rides`: Get rides created by the logged-in user.
- `GET /rides/my-booked-rides`: Get rides booked by the logged-in user.

### Reservations
- `POST /reserve/book`: Book a ride.
- `POST /reserve/accept`: Accept a booking request.
- `POST /reserve/reject`: Reject a booking request.

### Chat
- Real-time messaging via Socket.io events (`chat:join`, `chat:send`, `chat:message`).

## License

This project is licensed under the ISC License.
