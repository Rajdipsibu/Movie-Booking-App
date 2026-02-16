export interface CreateUserDTO {
  name: string;
  email: string;
  password_hash: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  password:string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}