import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebaseAdmin';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin not initialized properly');
    }
    
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Attach to request
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    
    next();
  } catch (error: any) {
    console.error('Error verifying auth token', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
