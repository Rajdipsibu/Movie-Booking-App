import { Router } from "express";
import authenticateJWT from "../middleware/auth.js";
import { confirmBookingController, createBooking, GetUserBookingsController, cancelBookingController, getBookedSeatsByShow } from "../controller/bookingController.js";


const router = Router();


router.get('/shows/:showId/booked-seats', getBookedSeatsByShow);
router.post('',authenticateJWT,createBooking);
router.get('/my',authenticateJWT,GetUserBookingsController);
router.post('/payment',authenticateJWT,confirmBookingController);

router.patch('/:id/cancel',authenticateJWT,cancelBookingController);
// router.get('/:id',authenticateJWT,GetSingleBookingController);

export default router;