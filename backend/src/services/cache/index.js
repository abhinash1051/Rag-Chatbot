// backend/src/services/cache/index.js
const Redis = require('redis');

// Get Redis client from main app
const redisClient = require('../../index').redisClient;

/**
 * Set a value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {number} expireSeconds - Expiration time in seconds (optional)
 */
async function set(key, value, expireSeconds = null) {
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.set(key, stringValue);
    if (expireSeconds) {
      await redisClient.expire(key, expireSeconds);
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {any} - Parsed value or null if not found
 */
async function get(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 */
async function del(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

module.exports = { set, get, del };