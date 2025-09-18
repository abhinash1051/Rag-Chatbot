const ragPipeline = require('../services/ragPipeline');
const cache = require('../services/cache');
const { v4: uuidv4 } = require('uuid');

const CHAT_HISTORY_PREFIX = 'chat_history_';

exports.sendMessage = async (req, res) => {
  try {
    let { sessionId, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!sessionId) sessionId = uuidv4();

    const cacheKey = `${CHAT_HISTORY_PREFIX}${sessionId}`;
    let chatHistory = (await cache.get(cacheKey)) || [];

    chatHistory.push({ role: 'user', content: message });

    const botReply = await ragPipeline.processQuery(message, chatHistory);

    chatHistory.push({ role: 'model', content: botReply });

    await cache.set(cacheKey, chatHistory);

    res.json({ sessionId, reply: botReply, history: chatHistory });
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const chatHistory = (await cache.get(`${CHAT_HISTORY_PREFIX}${sessionId}`)) || [];
    res.json({ history: chatHistory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

exports.clearSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    await cache.del(`${CHAT_HISTORY_PREFIX}${sessionId}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear session' });
  }
};
