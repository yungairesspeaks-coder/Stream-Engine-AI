# Yung Aires Stream Engine AI

Starter web app for ethical AI-assisted music marketing. Includes account registration/login, PostgreSQL campaign storage, AI-generated creative concepts (optional OpenAI), and a Railway Docker deployment definition.

## Deploy
1. Provision PostgreSQL in Railway.
2. Connect this GitHub repository to a Railway service.
3. Set DATABASE_URL to the Railway PostgreSQL reference, JWT_SECRET to a long random secret, and TOKEN_ENCRYPTION_KEY to 64 hex characters.
4. Set PORT=3000. Deploy and verify /health.

TikTok publishing is deliberately disabled. Before implementing it, complete TikTok developer app review, creator OAuth, secure token refresh, licensed video hosting, post status tracking, and explicit approval. Do not automate Spotify streams, plays, follows or engagement. Link clicks are not Spotify streams.

This is an MVP starter, not a production-ready 2,000-video renderer or auto-publisher. It does not render video files or publish automatically.

## TikTok URL verification
`src/tiktok-url-verifier.js` validates HTTPS TikTok video URLs against official TikTok hostnames and canonical video URL structure. The authenticated endpoint `POST /api/tools/verify-tiktok-url` accepts `{ "url": "https://www.tiktok.com/@creator/video/1234567890123456789" }`. TikTok short links are recognized as `needs_resolution`; the verifier does not follow redirects or claim that a video is live. Run checks with `npm test`.
