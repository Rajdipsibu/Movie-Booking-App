
import {type  Request, type Response,type  NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {type AuthRequest,type UserPayload} from '../interfaces/IAuth.js'

const JWT_SECRET = 'secretToken';

const authenticateJWT = (
  req: AuthRequest,
  res: Response, 
  next: NextFunction): void | Response => {
  
  // Get auth header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }


  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }
  
  try {

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token',error });
  }
};

export default authenticateJWT;