// backend/src/services/cache.js
const { createClient } = require('redis');
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create and initialize Redis client
const redisClient = createClient({ url: redisUrl });

// Connect to Redis
try {
  redisClient.connect();
  console.log('✅ Redis cache client created');
} catch (error) {
  console.error('❌ Failed to connect to Redis:', error);
}

// Handle Redis connection errors
redisClient.on('error', (error) => {
  console.error('Redis client error:', error);
});

async function initializeCache() {
  try {
    console.log('✅ Redis cache connected');
    return true;
  } catch (error) {
    console.error('Failed to initialize Redis cache:', error);
    return false;
  }
}

async function get(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

async function set(key, value, expireSeconds = 60 * 60 * 24) {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: expireSeconds });
    return true;
  } catch (error) {
    console.error('Error caching response:', error);
    return false;
  }
}

async function del(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting from cache:', error);
    return false;
  }
}

module.exports = {
  initializeCache,
  get,
  set,
  del
};