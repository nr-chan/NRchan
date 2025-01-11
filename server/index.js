const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const adminRoutes = require('./routes/admin');
const bannedUUID = require('./routes/banUUID');
const getuuidRoutes = require('./routes/getuuid');
const boardRoutes = require('./routes/board');
const boardsRoutes = require('./routes/boards');
const recentRoutes = require('./routes/recent');
const replyRoutes = require('./routes/reply');
const threadRoutes = require('./routes/thread');
const votes = require('./routes/votes');
const heartbeat = require('./routes/heartbeat');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet(
    {
        crossOriginResourcePolicy: false,

    }
));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'ip', 'Authorization', 'uuid']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
app.use('/images', express.static(path.join(__dirname, 'images'), { maxAge: sixMonthsInMs }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: sixMonthsInMs }));

mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Import routes

// Use routes
app.use('/board', boardRoutes);
app.use('/boards', boardsRoutes);
app.use('/recent', recentRoutes);
app.use('/reply', replyRoutes);
app.use('/thread', threadRoutes);
app.use('/admin', adminRoutes);
app.use('/getuuid', getuuidRoutes);
app.use('/banUUID', bannedUUID);
app.use('/votes', votes);
app.use('/heartbeat',heartbeat);

// Error handling middleware
app.use((err, _req, res, _) => {
    console.error(err.stack);

    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File size is too large. Maximum size is 5MB'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Unexpected field'
        });
    }

    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: '404 Route not found' });
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


//Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(async () => {
        console.log('Closed out remaining connections');
        await mongoose.connection.close();
        process.exit(0);
    });

    // If connections don't close in 10 seconds, forcefully shutdown
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

