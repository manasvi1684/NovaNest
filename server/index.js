// NovaNest/server/index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io for use in other modules
app.set('io', io);

// Make io available to routes
const teamSyncRoutes = require('./routes/api/teamSyncRoutes');
app.use('/api/teamsync', teamSyncRoutes);

const { router: notificationRoutes } = require('./routes/api/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a_fallback_secret_for_session_if_not_in_env',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

require('./config/passportConfig')(passport);

// --- MongoDB Connection ---
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/NovaNestDB';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected to NovaNestDB...'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
const authRoutes = require('./routes/api/auth');
app.use('/api/auth', authRoutes);

const thinkTrekRoutes = require('./routes/api/thinkTrekRoutes');
app.use('/api/thinktrek', thinkTrekRoutes);

const bugTraceRoutes = require('./routes/api/bugTraceRoutes');
app.use('/api/bugtrace', bugTraceRoutes);

const achievifyRoutes = require('./routes/api/achievifyRoutes');
app.use('/api/achievify', achievifyRoutes);

app.get('/', (req, res) => {
  res.send('Hello from NovaNest Backend! Server is running. Session and Google OAuth strategy configured.');
});

// --- Server Listening ---
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`NovaNest server running at http://localhost:${port}/`);
});