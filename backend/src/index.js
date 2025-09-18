require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const ragPipeline = require('./services/ragPipeline');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Initialize RAG pipeline
ragPipeline.initializeRAG().catch(err => {
  console.error('❌ Failed to initialize RAG pipeline:', err);
});

// Set up periodic news refresh (every 30 minutes)
const NEWS_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
setInterval(async () => {
  console.log('🔄 Refreshing news data...');
  try {
    await ragPipeline.initializeRAG();
    console.log('✅ News data refreshed successfully');
  } catch (err) {
    console.error('❌ Failed to refresh news data:', err);
  }
}, NEWS_REFRESH_INTERVAL);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Trying another port...`);
    const fs = require('fs');
    const path = require('path');
    // Try a random port between 8000 and 9000
    const newPort = Math.floor(Math.random() * 1000) + 8000;
    // Update the .env file with the new port
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/PORT=\d+/g, `PORT=${newPort}`);
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated PORT to ${newPort} in .env file. Please restart the server.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

// Export the app
module.exports = { app };
