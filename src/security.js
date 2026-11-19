const crypto=require("node:crypto");
function key(){const s=process.env.TOKEN_ENCRYPTION_KEY||"";if(!/^[a-f0-9]{64}$/i.test(s))throw Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters");return Buffer.from(s,"hex")}
function encryptSecret(v){const iv=crypto.randomBytes(12),c=crypto.createCipheriv("aes-256-gcm",key(),iv),d=Buffer.concat([c.update(v,"utf8"),c.final()]);return [iv,c.getAuthTag(),d].map(x=>x.toString("base64url")).join(".")}
module.exports={encryptSecret};