import { Router } from "express";
import authenticateJWT from "../middleware/auth.js";
import { confirmBookingController, createBooking, GetUserBookingsController , cancelBookingController} from "../controller/bookingController.js";


const router = Router();


router.post('',authenticateJWT,createBooking);
router.get('/my',authenticateJWT,GetUserBookingsController);
router.post('/payment',authenticateJWT,confirmBookingController);

router.patch('/:id/cancel',authenticateJWT,cancelBookingController);
// router.get('/:id',authenticateJWT,GetSingleBookingController);

export default router;