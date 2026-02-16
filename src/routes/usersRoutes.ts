import { Router } from "express";
import { forgotPassword, getUserDetails, loginController, registration, updateUserProfile, resetPassword } from "../controller/userController.js";
import authenticateJWT from "../middleware/auth.js";

const router = Router();


router.post('/registration',registration);
router.post('/login',loginController);
router.post('/fpassword',forgotPassword);
router.post('/resetPassword',resetPassword);
router.get('/',authenticateJWT,getUserDetails);
router.put('/profile', authenticateJWT, updateUserProfile);
export default router;