"use strict";

const ALLOWED_TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com"
]);

/**
 * Validate a TikTok URL without making a network request.
 *
 * Canonical video URLs are accepted only when they match:
 *   https://www.tiktok.com/@creator/video/1234567890123456789
 *
 * TikTok short links are recognized but deliberately returned as
 * "needs_resolution": a short URL cannot be proven to point to a video
 * without safely following its redirect.
 */
function verifyTikTokUrl(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { valid: false, status: "invalid", reason: "Enter a TikTok URL." };
  }

  if (input.length > 2048) {
    return { valid: false, status: "invalid", reason: "URL is too long." };
  }

  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return { valid: false, status: "invalid", reason: "That is not a valid URL." };
  }

  if (url.protocol !== "https:") {
    return { valid: false, status: "invalid", reason: "TikTok links must use HTTPS." };
  }

  if (url.username || url.password || url.port) {
    return { valid: false, status: "invalid", reason: "Credentials and custom ports are not allowed." };
  }

  const hostname = url.hostname.toLowerCase();
  if (!ALLOWED_TIKTOK_HOSTS.has(hostname)) {
    return { valid: false, status: "invalid", reason: "The URL must use an official TikTok domain." };
  }

  if (hostname === "vm.tiktok.com" || hostname === "vt.tiktok.com") {
    if (!/^\/[A-Za-z0-9]+\/?$/.test(url.pathname)) {
      return { valid: false, status: "invalid", reason: "That TikTok short-link format is not recognized." };
    }
    return {
      valid: false,
      status: "needs_resolution",
      reason: "Official TikTok short link recognized. Resolve its redirect before confirming the video destination.",
      inputUrl: url.toString()
    };
  }

  const match = url.pathname.match(/^\/@([A-Za-z0-9._-]{1,24})\/video\/(\d{10,25})\/?$/);
  if (!match) {
    return {
      valid: false,
      status: "invalid",
      reason: "Use a TikTok video URL in the format https://www.tiktok.com/@creator/video/VIDEO_ID."
    };
  }

  const canonicalUrl = "https://www.tiktok.com/@" + match[1] + "/video/" + match[2];
  return {
    valid: true,
    status: "syntax_valid",
    platform: "tiktok",
    creator: match[1],
    videoId: match[2],
    canonicalUrl
  };
}

module.exports = { verifyTikTokUrl };
