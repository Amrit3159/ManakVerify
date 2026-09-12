import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'maanakverify_development_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'maanakverify',
};
