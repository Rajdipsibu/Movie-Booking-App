import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db.js';
import type { IBooking } from '../interfaces/IBooking.js';

///
export const createBooking = async (bookingData: IBooking): Promise<number> => {
  const { user_id, show_id, seats, total_price } = bookingData;
  
  const query = `
    INSERT INTO bookings (user_id, show_id, seats, total_price) 
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.query<ResultSetHeader>(query, [
    user_id, 
    show_id, 
    seats, 
    total_price
  ]);

  return result.insertId;
};

///
export const getAllBooking = async (userId: number): Promise<any[]> => {
  const query = `
    SELECT 
      b.id AS booking_id,
      b.seats,
      b.total_price,
      b.created_at AS booking_time,
      b.booking_status AS booking_status,
      m.name AS movie_name,
      m.image AS movie_image,
      s.show_date,
      s.show_time,
      t.name AS theater_name,
      t.area AS theater_location
    FROM bookings b
    JOIN shows s ON b.show_id = s.id
    JOIN movie m ON s.movie_id = m.id
    JOIN theaters t ON s.theater_id = t.id
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC;
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
  
  return rows;
};

///
export const softDeleteBooking = async (bookingId: number, userId: number): Promise<boolean> => {
  const query = `
    UPDATE bookings 
    SET booking_status = 'cancelled' 
    WHERE id = ? AND user_id = ? AND booking_status != 'cancelled'
  `;

  const [result] = await pool.query<ResultSetHeader>(query, [bookingId, userId]);

  return result.changedRows > 0;
};