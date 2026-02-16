import { type Request, type Response } from 'express';
import { getAllTheater, getByMovieId, getByTheaterId, getShows, getShowsDate } from '../models/theater_movies.js';
import pool from '../config/db.js';

//get all theaters by a movie:
export const getTheatersbyMovieController = async (req: Request, res: Response) => {
  try {
    const movieId = Number(req.params.id);

    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid Movie ID" });
    }
    const theaters = await getByMovieId(movieId);

    res.status(200).json({
      success: true,
      data: theaters
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all movies by theater:
export const getMoviebyTheatersController = async (req: Request, res: Response) => {
  try {
    const theaterId = Number(req.params.id);

    if (isNaN(theaterId)) {
      return res.status(400).json({ message: "Invalid Theater ID" });
    }
    const Movies = await getByTheaterId(theaterId);

    res.status(200).json({
      success: true,
      data: Movies
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all shows:according to movie_id and theater_id:
interface ShowQuery extends Request {
  movieId?: string;
  theaterId?: string;
  date?: string;
}

//get all show date and show time:
export const getShowsController = async (req: ShowQuery, res: Response) => {
  try {
    const { movieId, theaterId, date } = req.query;
    if (!movieId || !theaterId || !date) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }
    if (typeof date !== 'string') {
      return res.status(400).json({ message: "Invalid or missing date" });
    }
    const shows = await getShows(Number(movieId), Number(theaterId), date);

    res.status(200).json({
      success: true,
      shows
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//get all show date:
export const getShowDateController = async (req: ShowQuery, res: Response) => {
  try {
    const { movieId, theaterId } = req.query;
    if (!movieId || !theaterId) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }
    const shows_date = await getShowsDate(Number(movieId), Number(theaterId));

    res.status(200).json({
      success: true,
      shows_date
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getTheatersController=async(req: Request, res: Response)=>{
  try{
    console.log("theater========");
    
    const theater = await getAllTheater();
    res.status(200).json({success: true,theater})
  }catch(err){
    res.status(500).json({messgae:"error to fetch theater"});
  }
}
///
export const getAllMovie_ShowsController = async (req: Request, res: Response) => {
    const { id } = req.params;

    const query = `
    SELECT 
    s.id AS show_id,
    s.show_date,
    s.show_time,
    m.id AS movie_id,
    m.name AS movie_name,
    m.image AS movie_image,
    m.duration,
    m.rating,
    t.name AS theater_name,
    t.area AS theater_area
    FROM shows s
    INNER JOIN movie m ON s.movie_id = m.id
    INNER JOIN theaters t ON s.theater_id = t.id
    WHERE s.theater_id = ? 
    AND s.show_date >= CURDATE() 
    ORDER BY s.show_date, s.show_time
    `;

    try {
        const [rows] = await pool.query(query, [id]);
        res.status(200).json({ success: true, showtimes: rows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching showtimes" });
    }
};