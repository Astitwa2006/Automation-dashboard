const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(helmet());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/workflows', require('./routes/workflows'));
app.use('/api/executions', require('./routes/executions'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

if (require.main === module) {
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

module.exports = app;
