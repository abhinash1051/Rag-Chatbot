const { redisClient } = require('../../index');
const DEFAULT_TTL = 60 * 60;

exports.set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    return true;
  } catch (err) {
    console.error('Cache set error:', err);
    return false;
  }
};

exports.get = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

exports.del = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err);
    return false;
  }
};
