require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: { origin: "*" }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/course', require('./routes/courseRoutes'));
app.use('/api/assignment', require('./routes/assignmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/test', require('./routes/testRoutes'));

// Basic Route
app.get('/', (req, res) => res.send('LMS API Running'));

// Socket.io Realtime Logic
io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Joined room: ${room}`);
    });

    socket.on('chatMessage', (data) => {
        io.to(data.room).emit('message', data);
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
