/**
 * Sharing Service for Pet Knowledge
 * Manages automatic knowledge sharing with the user
 */

import { getKnowledgeSharing } from '../api/llm';

const LAST_SHARE_KEY = 'pet_sharing_last_share';
const SHARE_ENABLED_KEY = 'pet_sharing_enabled';
const SHARE_HOUR_START = 8; // 8 AM
const SHARE_HOUR_END = 22; // 10 PM
const MIN_SHARE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if sharing is enabled
 * @returns {boolean} Whether sharing is enabled
 */
export function isSharingEnabled() {
  return localStorage.getItem(SHARE_ENABLED_KEY) !== 'false';
}

/**
 * Enable/disable sharing
 * @param {boolean} enabled - Whether to enable sharing
 */
export function setSharingEnabled(enabled) {
  localStorage.setItem(SHARE_ENABLED_KEY, enabled);
}

/**
 * Check if we should share knowledge (not in night hours)
 * @returns {boolean} Whether sharing is appropriate now
 */
function shouldShareNow() {
  const hour = new Date().getHours();
  return hour >= SHARE_HOUR_START && hour < SHARE_HOUR_END;
}

/**
 * Check if enough time has passed since last share
 * @returns {boolean} Whether enough time has passed
 */
function isShareIntervalPassed() {
  const lastShare = localStorage.getItem(LAST_SHARE_KEY);
  if (!lastShare) return true;

  const lastShareTime = parseInt(lastShare, 10);
  return Date.now() - lastShareTime >= MIN_SHARE_INTERVAL;
}

/**
 * Record that a share has been sent
 */
function recordShare() {
  localStorage.setItem(LAST_SHARE_KEY, Date.now().toString());
}

/**
 * Get a knowledge sharing message
 * @param {string} context - Optional conversation context
 * @returns {Promise<string>} Knowledge sharing message
 */
export async function getShareMessage(context = '') {
  if (!shouldShareNow()) {
    return null;
  }

  if (!isShareIntervalPassed()) {
    return null;
  }

  const message = await getKnowledgeSharing(context);
  recordShare();
  return message;
}

/**
 * Start automatic knowledge sharing interval
 * @param {Function} onShare - Callback when a share is ready
 * @returns {Function} Cleanup function to stop the interval
 */
export function startSharingInterval(onShare) {
  let intervalId = null;

  const checkAndShare = async () => {
    if (!isSharingEnabled()) return;

    if (!shouldShareNow()) {
      console.log('Outside sharing hours, skipping...');
      return;
    }

    if (!isShareIntervalPassed()) {
      return;
    }

    const message = await getShareMessage();
    if (message) {
      onShare(message);
    }
  };

  // Check every 15 minutes
  intervalId = setInterval(checkAndShare, 15 * 60 * 1000);

  // Also check immediately
  checkAndShare();

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

/**
 * Get sharing statistics
 * @returns {Object} Sharing statistics
 */
export function getSharingStats() {
  const lastShare = localStorage.getItem(LAST_SHARE_KEY);
  return {
    enabled: isSharingEnabled(),
    lastShare: lastShare ? new Date(parseInt(lastShare, 10)) : null,
    hours: `${SHARE_HOUR_START}:00 - ${SHARE_HOUR_END}:00`
  };
}
