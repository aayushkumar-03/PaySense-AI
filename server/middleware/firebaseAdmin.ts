import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import path from 'path';

// ensure env variables are loaded (assuming running from /server or root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  if (config.projectId && config.clientEmail && config.privateKey) {
    initializeApp({
      credential: cert(config as any),
    });
  } else {
    console.warn('Firebase Admin credentials missing. Auth middleware will mock or fail.');
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
