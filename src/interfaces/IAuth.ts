import {type  Request } from 'express';

export interface UserPayload {
  id: number | undefined;
  email: string;
  name: string;
  iat?:number;
  exp?:number;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}