import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import type { ITheater } from "../interfaces/ITheater.js";
import type { Movie } from "../interfaces/IMovie.js";



//get theater by movie_id:
export const getByMovieId = async (movie_id: number): Promise<ITheater[]> => {
  const query = `
    SELECT DISTINCT t.*
    FROM theaters t
    JOIN shows s ON t.id = s.theater_id
    WHERE s.movie_id = ?
    AND s.show_date >= CURDATE();
  `;
  
  const [rows] = await pool.query<RowDataPacket[]>(query, [movie_id]);
  
  // Return the entire array of theaters found
  return rows as ITheater[]; 
};

//get movies by theater_id:
export const getByTheaterId = async (theater_id: number): Promise<Movie[]> => {
  const query = `
    SELECT DISTINCT m.*
    FROM movie m
    JOIN shows s ON m.id = s.movie_id
    WHERE s.theater_id = ?
    AND s.show_date >= CURDATE();
  `;
  
  const [rows] = await pool.query<RowDataPacket[]>(query, [theater_id]);
  
  // Return the entire array of theaters found
  return rows as Movie[]; 
};

//get showTime by movieId,theaterId,showDate
interface IShows{
  show_date:Date;
  show_time:string;
}
export const getShows = async(movie_id:number,theater_id:number,show_date:string):Promise<IShows[]>=>{
  const query = `SELECT show_date, show_time
  FROM shows
  WHERE movie_id = ?
  AND theater_id = ?
  AND show_date = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(query,[movie_id,theater_id,show_date]);
  
  return rows as IShows[];
}

//get show date by movies and theater id
interface IShowsDate{
  show_date:Date;
}
export const getShowsDate = async(movie_id:number,theater_id:number):Promise<IShowsDate[]>=>{
  const query = `SELECT show_date
  FROM shows
  WHERE movie_id = ?
  AND theater_id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(query,[movie_id,theater_id]);
  
  return rows as IShows[];
}

//get all theater:
interface Itheater{
  id:number;
  name:string;
  area:string;
  address:string;
  total_rows:number;
  total_columns:number;
  is_active:boolean;
}
export const getAllTheater = async():Promise<Itheater[]>=>{
  const query = `SELECT * FROM theaters;
`;
  const [rows] = await pool.query<RowDataPacket[]>(query);
  
  return rows as Itheater[];
}

///