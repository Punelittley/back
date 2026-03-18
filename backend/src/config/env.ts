import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/clinic_portal",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev_jwt_secret",
  cookieSecret: process.env.COOKIE_SECRET ?? "dev_cookie_secret",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

