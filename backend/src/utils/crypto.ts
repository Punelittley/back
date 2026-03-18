import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit nonce for GCM

const DEV_KEY = "dev-encryption-key-32-bytes!!"; // только для разработки

function getKey(): Buffer {
  const key = env.encryptionKey;
  const raw = key && key.length > 0 ? key : DEV_KEY;

  if (raw.length === 32) {
    return Buffer.from(raw, "utf8");
  }

  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length === 64) {
    return Buffer.from(raw, "hex");
  }

  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(cipherText: string): string {
  const data = Buffer.from(cipherText, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.subarray(IV_LENGTH + 16);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

