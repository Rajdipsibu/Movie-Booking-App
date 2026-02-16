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
// GROUP BY s.id`;
    const [rows]: any = await pool.query(query, [show_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};