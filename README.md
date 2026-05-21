# Real Time Chat Application (MERN + Socket.io)

A beginner-friendly full-stack real time chat app built with:
- **Frontend:** React.js (Vite) + Tailwind CSS + Socket.io-client
- **Backend:** Node.js + Express.js + MongoDB (Mongoose) + Socket.io
- **Auth:** JWT + bcrypt
- **Media uploads:** Cloudinary (images, videos, PDFs)

## Features
- Register / Login / Logout with JWT
- Real-time text messaging with Socket.io
- Send images, videos, PDFs (Cloudinary)
- Online / offline user status
- Typing indicator
- Message seen / unread count
- Auto scroll to latest message
- Search users by name or email
- Profile update (name, bio, profile picture)
- Dark mode / Light mode toggle
- Toast notifications
- Mobile responsive
- Protected routes

---

## Project Structure
```
chat-app/
├── backend/        # Node + Express + MongoDB + Socket.io
└── frontend/       # React (Vite) + Tailwind
```

---

## 1) Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (copy from `.env.example`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the backend:
```bash
npm run server
```

Backend runs at: `http://localhost:5000`

---

## 2) Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## How to get Cloudinary keys
1. Go to https://cloudinary.com/ and sign up (free).
2. Open your **Dashboard** — copy **Cloud Name**, **API Key**, **API Secret**.
3. Paste them into `backend/.env`.

## How to run MongoDB
- Install MongoDB locally OR use a free MongoDB Atlas cluster.
- Put the connection string into `MONGO_URI`.

---

## How it works (for viva)
1. User registers → password is hashed with **bcrypt** → saved in MongoDB.
2. Login → server verifies password → returns a **JWT token** → stored in localStorage.
3. Protected routes check the token using **auth middleware**.
4. After login, the React app opens a **Socket.io** connection.
5. Each connected user is mapped `userId → socketId` on the server.
6. When user A sends a message → saved in MongoDB → emitted via socket → user B receives it instantly.
7. Files (images/videos/PDFs) are uploaded to **Cloudinary**, only the URL is stored in MongoDB.

Enjoy! 
