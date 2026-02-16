import { createUser, getUserByEmail } from "../models/userModel.js";
import type{ Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { AuthRequest, UserPayload } from "../interfaces/IAuth.js";
import pool from "../config/db.js";
import type { RowDataPacket } from "mysql2";
import { sendLoginMail } from "../utils/sendMail.js";
import crypto from 'crypto';
const JWT_SECRET = 'secretToken';

//registration
export const registration = async(req:Request,res:Response) => {
  try{
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result: [number, number] = await createUser({name, email, password_hash});

    if(result[0]===1){
      res.status(201).json({
        message: "User register successfully..", 
        id: result[1]
      })
    }

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}


//login
export const loginController = async(req:Request,res:Response) => {
  try{
    console.log("login");
    
    const {email,password} = req.body;

    const user = await getUserByEmail(email);

    if(!user) return res.status(404).json({ message: "Invalid Email or Password" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    //Generate JWT
    const payload: UserPayload = { 
      id: user.id, 
      name: user.name, 
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ message: "login successful", token });
  }
  catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

//getUserDetails
export const getUserDetails = async(req:AuthRequest,res:Response)=>{
  try{
    const id = req.user?.id;
    console.log(id);
    
    const query = `select * from user where id=?`;
    const [row] = await pool.query<RowDataPacket[]>(query,[id]);
    console.log(row[0]);
    if(row.length>0){
      return res.status(200).json({row})
    }
    return res.status(401).json({success:false,message:"user not found"});
  }
  catch(err:any){
    res.status(500).json({success:false,message:err.message})
  }
}


//updateUserProfile
export const updateUserProfile = async (req: AuthRequest, res: Response)=>{
  try {
    const id = req.user?.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await pool.query(
      `UPDATE user SET name = ?, email = ? WHERE id = ?`,
      [name, email, id]
    );

    res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile update failed" });
  }

}



// // 1. Send OTP
// export const forgotPassword = async (req: Request, res: Response) => {
//     const { email } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
//     const expiry = new Date(Date.now() + 5 * 60000); // 5 mins from now

//     try {
//         const [user]: any = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
//         if (user.length === 0) return res.status(404).json({ message: "User not found" });

//         await pool.query(
//             "UPDATE user SET otp_code = ?, otp_expiry = ? WHERE email = ?", 
//             [otp, expiry, email]
//         );
//         //mail sending
//     await sendLoginMail(
//       email,
//       `LOGIN MovieBooking`,
//       `<h3>Your OTP Code</h3>
//       <h2>${otp}</h2>
//       <p>This OTP is valid for 5 minutes.</p>
//       <small>Do not share this OTP with anyone.</small>
//       `
//     )   
//         // In a real app, use nodemailer here to send the email
//         console.log(`OTP for ${email}: ${otp}`); 

//         res.status(200).json({ success: true, message: "OTP sent successfully" });
//     } catch (err) {
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


// 1. forgot password send a reset mail:============
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    //checking the user email exist or not:
    const [users]: any = await pool.query("SELECT id FROM user WHERE email = ? and status = 1", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    
    // 2. Create Token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await pool.query(
    "UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
    [token, expiry, email]
    );
    //mail sending
    const resetLink = `http://localhost:5173/reset-password/${token}`;    
    await sendLoginMail(
      email,
      "Password Reset Request",
      `
      <p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>
      <p>if not working then copy the link ${`http://localhost:5173/reset-password/${token}`}</p>
      `
    )   
    res.json({ success: true, message: "Reset link sent to email." });
    
};



// 2. Reset the Password
export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    // 1. Find user with valid token and not expired
    const [users]: any = await pool.query(
      "SELECT id FROM user WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );
    if (users.length === 0) return res.status(400).json({ message: "Invalid or expired token" });
    // 2. Hash new password & clear token
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE user SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, users[0].id]
    );
    res.json({ success: true, message: "Password updated successfully!" });
    
};
