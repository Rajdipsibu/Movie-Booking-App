import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { CreateUserDTO, UserResponse } from "../interfaces/IUser.js";
import pool from "../config/db.js";



//=========register=========
export const createUser = async(data:CreateUserDTO): Promise<[number, number]>=>{
  try{
    const query = `INSERT INTO user (name, email,password)
    VALUES (?,?,?);`
    const [result] = await pool.execute<ResultSetHeader>(query,[data.name,data.email,data.password_hash]);
    
    return [result.affectedRows, result.insertId];
  }
  catch(error){
    console.error("Error register user: ", error);
    throw error;
  }
}


//get user with email:
export const getUserByEmail=async(email:string):Promise<UserResponse | null>=>{
  try{
  const [row] = await pool.execute<RowDataPacket[]>("SELECT * FROM user WHERE email = ?",[email]);

  const user_details = row[0] as UserResponse;
  return user_details || null;
  }
  catch(error){
    console.error("error for get user by email: ",error);
    throw error;
  }

}