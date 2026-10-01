const Notification = require('../models/Notification');

/**
 * Creates and saves a notification for a user
 * @param {Object} options
 * @param {string} options.recipient - User ObjectId
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.type] - Notification category
 * @param {string} [options.link] - Deep link URL
 */
const createNotification = async ({ recipient, title, message, type = 'system', link = '' }) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
