"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { verifyTikTokUrl } = require("../src/tiktok-url-verifier");

test("accepts canonical TikTok video URLs", () => {
  const result = verifyTikTokUrl("https://www.tiktok.com/@artist/video/1234567890123456789");
  assert.equal(result.valid, true);
  assert.equal(result.status, "syntax_valid");
  assert.equal(result.creator, "artist");
  assert.equal(result.videoId, "1234567890123456789");
});

test("rejects lookalike domains", () => {
  const result = verifyTikTokUrl("https://tiktok.com.example.org/@artist/video/1234567890123456789");
  assert.equal(result.valid, false);
  assert.equal(result.status, "invalid");
});

test("recognizes short links without claiming their destination is verified", () => {
  const result = verifyTikTokUrl("https://vm.tiktok.com/AbC123/");
  assert.equal(result.valid, false);
  assert.equal(result.status, "needs_resolution");
});

test("rejects HTTP links", () => {
  const result = verifyTikTokUrl("http://www.tiktok.com/@artist/video/1234567890123456789");
  assert.equal(result.valid, false);
});

test("rejects profile URLs when a video URL is required", () => {
  const result = verifyTikTokUrl("https://www.tiktok.com/@artist");
  assert.equal(result.valid, false);
});
