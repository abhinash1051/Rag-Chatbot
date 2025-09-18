const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chat API is running' });
});

router.post('/message', chatController.sendMessage);
router.get('/history/:sessionId', chatController.getChatHistory);
router.delete('/session/:sessionId', chatController.clearSession);

module.exports = router;
