const crypto = require("crypto");

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");

  return `${salt}:${hash}`;
};

const comparePassword = (password, storedPassword) => {
  const [salt, originalHash] = storedPassword.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
};

module.exports = {
  hashPassword,
  comparePassword,
};
