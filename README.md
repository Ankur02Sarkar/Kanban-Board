# Kanban Board Application

A modern, responsive Kanban board application with real-time updates, drag-and-drop functionality, and user authentication.

**Live Demo:** [https://kanbanboard-pixeltech.vercel.app/](https://kanbanboard-pixeltech.vercel.app/)


## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── board/          # Board management
│   │   ├── column/         # Column management
│   │   ├── task/           # Task management
│   │   └── socket/         # WebSocket endpoint
│   ├── board/              # Board page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── modals/             # Modal components
│   │   ├── BoardModal.tsx  # Board creation/editing
│   │   ├── ColumnModal.tsx # Column creation/editing
│   │   └── TaskModal.tsx   # Task creation/editing
│   ├── Column.tsx          # Column component
│   ├── Task.tsx            # Task component
│   └── NavBar.tsx          # Navigation bar
└── lib/                    # Utility functions & modules
    ├── auth/               # Authentication utilities
    ├── context/            # React context providers
    ├── models/             # Mongoose models
    ├── socket/             # Socket.IO configuration
    └── utils/              # Helper functions
```

## Features

- **User Authentication**
  - Secure signup/login with email & password
  - JWT-based authentication
  - Protected routes for authorized users

- **Board Structure**
  - One board per user
  - Multiple columns (e.g., To Do, In Progress, Done)
  - Tasks with title and description

- **Advanced UI Features**
  - Smooth drag-and-drop functionality for tasks and columns
  - Animated UI elements using Framer Motion
  - Modern glassmorphism design with card shadows
  - Fully responsive design for all device sizes

- **Real-time Updates**
  - WebSocket integration using Socket.IO
  - Collaborative editing with instant updates
  - Real-time notifications for board changes

## Tech Stack

### Frontend
- **Next.js 15** - ReactJS framework with App Router
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **DND Kit** - Drag and drop toolkit
- **Lucide React** - Icon library
- **React Hot Toast** - Notification system

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Socket.IO** - Real-time communication

### Deployment
- **Vercel** - Hosting platform

## API Documentation

Important Note on API Usage: The base URL for all API endpoints is the same as the deployed application's domain. For example, to access the `/api/board` endpoint, you would use: `https://kanbanboard-pixeltech.vercel.app/api/board`

### Authentication

- **POST /api/auth/signup**
  - Create a new user account
  - Body: `{ name: string, email: string, password: string }`
  - Response: `{ user: User, token: string }`

- **POST /api/auth/login**
  - Authenticate a user
  - Body: `{ email: string, password: string }`
  - Response: `{ user: User, token: string }`

- **GET /api/auth/me**
  - Get the current authenticated user
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ user: User }`

- **POST /api/auth/logout**
  - Logout the current user
  - Response: `{ success: true }`

### Board Management

- **GET /api/board**
  - Get the user's board with columns and tasks
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ board: Board }`

- **POST /api/board**
  - Create a new board
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title: string }`
  - Response: `{ board: Board }`

### Column Management

- **POST /api/column**
  - Add a new column to the board
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title: string }`
  - Response: `{ column: Column }`

- **PATCH /api/column/[id]**
  - Update a column
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title: string }`
  - Response: `{ column: Column }`

- **DELETE /api/column/[id]**
  - Delete a column
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success: true }`

### Task Management

- **POST /api/task**
  - Add a new task to a column
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title: string, description: string, column: string }`
  - Response: `{ task: Task }`

- **PATCH /api/task/[id]**
  - Update a task (including moving to another column)
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ title?: string, description?: string, column?: string }`
  - Response: `{ task: Task }`

- **DELETE /api/task/[id]**
  - Delete a task
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success: true }`

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ankur02Sarkar/kanban-board.git
   cd kanban-board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban

   # JWT Secret for authentication
   JWT_SECRET=your_jwt_secret

   # Next.js environment variable
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Configure the environment variables
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
