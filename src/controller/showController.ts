import { type Request, type Response } from 'express';
import pool from "../config/db.js";

export const getShowDetailsById = async (req: Request, res: Response) => {
  try {
    const { show_id } = req.params;

    const query = `
      SELECT 
        s.id AS show_id,
        s.show_date,
        s.show_time,
        m.name AS movie_name,
        m.image AS movie_image,
        t.name AS theater_name,
        t.area AS theater_area,
        t.total_rows,
        t.total_columns
      FROM shows s
      INNER JOIN movie m ON s.movie_id = m.id
      INNER JOIN theaters t ON s.theater_id = t.id
      WHERE s.id = ?;
    `;
//     const q2 = `SELECT * FROM moviebookingsystem.bookings;SELECT 
//     s.id AS show_id,
//     s.show_date,
//     s.show_time,
//     m.name AS movie_name,
//     m.image AS movie_image,
//     t.name AS theater_name,
//     t.area AS theater_area,
//     t.total_rows,
//     t.total_columns,
//     b.seats
// FROM shows s
// INNER JOIN movie m ON s.movie_id = m.id
// INNER JOIN theaters t ON s.theater_id = t.id
// LEFT JOIN bookings b ON s.id = b.show_id AND b.booking_status = 'confirmed'
// WHERE s.id = ?
    const [rows]: any = await pool.query(query, [show_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Fetch occupied and active pending seats for this show
    const seatsQuery = `
      SELECT seats FROM bookings 
      WHERE show_id = ? 
        AND (
          booking_status = 'confirmed' 
          OR (booking_status = 'pending' AND (created_at >= NOW() - INTERVAL 10 MINUTE OR created_at IS NULL))
        )
    `;
    const [seatsRows]: any = await pool.query(seatsQuery, [show_id]);

    const occupiedSeats = new Set<string>();
    for (const r of seatsRows) {
      if (r.seats) {
        const clean = String(r.seats).replace(/[\[\]'"]/g, "");
        clean.split(',').forEach((s: string) => {
          const trimmed = s.trim().toUpperCase();
          if (trimmed) occupiedSeats.add(trimmed);
        });
      }
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        ...rows[0],
        occupied_seats: Array.from(occupiedSeats)
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};