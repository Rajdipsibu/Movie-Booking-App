import { type Request, type Response } from 'express';
import type { AuthRequest } from '../interfaces/IAuth.js';
import {  getAllBooking, softDeleteBooking } from '../models/bookingModel.js';
import pool from '../config/db.js';
import { sendLoginMail } from '../utils/sendMail.js';


//Read All
export const GetUserBookingsController = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is populated by your authenticateJWT middleware
    const userId = req.user!.id;

    const bookings = await getAllBooking(Number(userId));

    // Logic: If the database query works, we return the data (even if it's empty)
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
    
  } catch (err: any) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

///soft delete
export const cancelBookingController = async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user!.id;

    const isUpdated = await softDeleteBooking(bookingId, Number(userId));

    if (!isUpdated) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found, already cancelled, or unauthorized." 
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated to cancelled."
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

///
// Controller: bookingsController.ts
export const createBooking = async (req: AuthRequest, res: Response) => {
    let connection;
    try {
        const { show_id, seats_booked, total_price } = req.body;
        const user_id = (req as any).user?.id || req.body.user_id;

        if (!show_id || !seats_booked) {
            return res.status(400).json({
                success: false,
                message: "Show ID and seats are required"
            });
        }

        // Parse seats to clean array of uppercase strings
        const requestedSeats: string[] = (
            Array.isArray(seats_booked) 
                ? seats_booked 
                : String(seats_booked).split(',')
        )
            .map((s: string) => String(s).trim().toUpperCase())
            .filter((s: string) => s.length > 0);

        if (requestedSeats.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one seat"
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Lock and check existing active bookings for this show
        const checkSql = `
            SELECT seats 
            FROM bookings 
            WHERE show_id = ? 
              AND (
                booking_status = 'confirmed' 
                OR (booking_status = 'pending' AND (created_at >= NOW() - INTERVAL 10 MINUTE OR created_at IS NULL))
              )
            FOR UPDATE
        `;

        const [existingRows]: any = await connection.execute(checkSql, [show_id]);

        const occupiedSet = new Set<string>();
        for (const row of existingRows) {
            if (row.seats) {
                const clean = String(row.seats).replace(/[\[\]'"]/g, "");
                clean.split(',').forEach((s: string) => {
                    const trimmed = s.trim().toUpperCase();
                    if (trimmed) occupiedSet.add(trimmed);
                });
            }
        }

        // 2. Check if any requested seat is already booked or reserved
        const conflictingSeats = requestedSeats.filter(seat => occupiedSet.has(seat));

        if (conflictingSeats.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: `Seat(s) ${conflictingSeats.join(', ')} already booked or reserved! Please choose different seats.`,
                conflictingSeats,
                occupiedSeats: Array.from(occupiedSet)
            });
        }

        // 3. If seats are available, insert booking with pending status
        const seatsForDb = requestedSeats.join(',');
        const insertSql = `
            INSERT INTO bookings (user_id, show_id, seats, total_price, booking_status)
            VALUES (?, ?, ?, ?, 'pending')
        `;

        const [result]: any = await connection.execute(insertSql, [
            user_id, 
            show_id, 
            seatsForDb, 
            total_price
        ]);

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Booking created!",
            booking_id: result.insertId
        });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("Booking Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

///
export const getBookedSeatsByShow = async (req: Request, res: Response) => {
    const { showId } = req.params;

    try {
        const [rows]: any = await pool.execute(
            `SELECT seats FROM bookings 
             WHERE show_id = ? 
               AND (
                 booking_status = 'confirmed' 
                 OR (booking_status = 'pending' AND (created_at >= NOW() - INTERVAL 10 MINUTE OR created_at IS NULL))
               )`,
            [showId]
        );

        const occupiedSeats = rows
            .map((row: any) => {
                const cleanString = String(row.seats || "").replace(/[\[\]'"]/g, "");
                return cleanString.split(',');
            })
            .flat()
            .map((s: string) => s.trim().toUpperCase())
            .filter((s: string) => s.length > 0);

        const uniqueOccupiedSeats = Array.from(new Set(occupiedSeats));

        return res.status(200).json({
            success: true,
            bookedSeats: uniqueOccupiedSeats
        });
    } catch (error: any) {
        console.error("Error fetching booked seats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// export const getAllBooking=async(req:AuthRequest,res:Response)=>{

// }

export const getShowsByMovieAndTheater = async (req: Request, res: Response) => {
    const { movieId, theaterId } = req.params;

    // We join with the theaters table to get theater-specific info (like rows/cols) 
    // and movies to confirm we have the right metadata.
    const sql = `
        SELECT 
            s.id AS show_id,
            s.show_date,
            s.show_time,
            
            m.name AS movie_name,
            t.name AS theater_name,
            t.total_rows,
            t.total_columns
        FROM shows s
        INNER JOIN movie m ON s.movie_id = m.id
        INNER JOIN theaters t ON s.theater_id = t.id
        WHERE s.movie_id = ? 
          AND s.theater_id = ? 
          AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC
    `;

    try {
        const [rows]: any = await pool.execute(sql, [movieId, theaterId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No shows found for this movie at the selected theater."
            });
        }

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error: any) {
        console.error("Error fetching shows:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//confirm  booking from payment gateway:
export const confirmBookingController = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Destructure the ID from the request body
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const query = `UPDATE bookings SET booking_status = 'confirmed' WHERE id = ? AND booking_status = 'pending'`;

    const [result]: any = await pool.query(query, [id]);
    
    // 2. Execute query (ResultSetHeader contains affectedRows)
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found or already confirmed" 
      });
    }
    //fetch all details of the booking
    const detailsQuery = `SELECT 
        b.seats, b.total_price, 
        m.name AS movie_name, 
        t.name AS theater_name, t.area AS theater_area,
        u.email AS user_email
      FROM moviebookingsystem.bookings b
      JOIN moviebookingsystem.shows s ON b.show_id = s.id
      JOIN moviebookingsystem.movie m ON s.movie_id = m.id
      JOIN moviebookingsystem.theaters t ON s.theater_id = t.id
      JOIN moviebookingsystem.user u ON b.user_id = u.id
      WHERE b.id = ?`;
    const [rows]: any = await pool.query(detailsQuery, [id]);
    const booking = rows[0];
    console.log(rows)
    // 3. Send the Confirmation Email
    await sendLoginMail(booking.user_email,
      "Booking Confirmation details",
      `
      <h3>Movie Name: ${booking.movie_name}</h3>
      <p>City: ${booking.theater_area}</p>
      <p>Theater: ${booking.theater_name}</p>
      <p>Your Seat No: ${booking.seats}</p>
      <p>Total Price: ${booking.total_price}</p>
      `);
    return res.status(200).json({ 
      success: true, 
      message: "Booking confirmed and email sent! 📧" 
    });

  } catch (error: any) {
    console.error("Error in confirmBookingController:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: error.message 
    });
  }
};


