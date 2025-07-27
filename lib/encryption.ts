// Simple encryption for sensitive data (use proper encryption in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "demo-key-not-secure"

export const encrypt = (text: string): string => {
  if (process.env.NODE_ENV === "development") {
    return `encrypted_${text}` // Simple demo encryption
  }

  // In production, use proper encryption like crypto-js or similar
  try {
    const crypto = require("crypto")
    const cipher = crypto.createCipher("aes192", ENCRYPTION_KEY)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    return text
  }
}

export const decrypt = (encryptedText: string): string => {
  if (process.env.NODE_ENV === "development") {
    return encryptedText.replace("encrypted_", "") // Simple demo decryption
  }

  try {
    const crypto = require("crypto")
    const decipher = crypto.createDecipher("aes192", ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedText
  }
}
