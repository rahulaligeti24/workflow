const crypto = require("crypto");

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || "change-me-jwt-secret";
  const expiresInDays = Number(process.env.JWT_EXPIRES_IN_DAYS || 7);
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

  return `${data}.${signature}`;
};

module.exports = {
  signToken,
};
