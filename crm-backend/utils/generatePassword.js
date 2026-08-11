const crypto = require("crypto");

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%&*";

const ALL_CHARS = UPPER + LOWER + NUMBERS + SYMBOLS;

/**
 * Generates a cryptographically secure random password.
 * Guarantees inclusion of uppercase, lowercase, numbers, and symbols.
 * 
 * @param {number} length - Desired password length (default: 10)
 * @returns {string} Plaintext password
 */
function generatePassword(length = 10) {
  if (length < 8) {
    throw new Error("Password length should be at least 8 characters.");
  }

  // Ensure at least one character from each character class
  const requiredChars = [
    UPPER[crypto.randomInt(0, UPPER.length)],
    LOWER[crypto.randomInt(0, LOWER.length)],
    NUMBERS[crypto.randomInt(0, NUMBERS.length)],
    SYMBOLS[crypto.randomInt(0, SYMBOLS.length)],
  ];

  // Fill remaining length with random characters from combined set
  const remainingLength = length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    requiredChars.push(ALL_CHARS[crypto.randomInt(0, ALL_CHARS.length)]);
  }

  // Cryptographically shuffle the array (Fisher-Yates)
  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  return requiredChars.join("");
}

module.exports = generatePassword;