import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db.js';
import type { ICreateMovie, Movie } from '../interfaces/IMovie.js';


//insert movie
export const createMovies = async(data:ICreateMovie): Promise<[number, number]>=>{
  try{
    const query = `INSERT INTO movie (name, price)
    VALUES (?,?);`
    const [result] = await pool.execute<ResultSetHeader>(query,[data.name,data.price]);
    
    return [result.affectedRows, result.insertId];
  }
  catch(error){
    console.error("Error insert movies: ", error);
    throw error;
  }
}

//read moovie
export const getMoviesById=async(id:number):Promise<Movie | null>=>{
  try{
  const [row] = await pool.execute<RowDataPacket[]>("SELECT * FROM movie WHERE id = ?",[id]);
  
  if (row.length === 0) {
      return null;
  }
  return row[0] as Movie;
  }
  catch(error){
    console.error("error for get movie by title: ",error);
    throw error;
  }

}
//get all movies:
export const getAllMovies = async (limit:number, offset:number): Promise<Movie[]> => {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM movie LIMIT ? OFFSET ?",[limit, offset]);
  return rows as Movie[];
};

//delete movie
//update movie
export const getMoviesWithCount = async (limit: number, offset: number): Promise<{ movies: Movie[], total: number }> => {
  // Query 1: Get the actual movie data
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM movie LIMIT ? OFFSET ?",
    [limit, offset]
  );

  // Query 2: Get the total count of all active movies
  const [countResult]: any = await pool.query(
    "SELECT COUNT(*) as total FROM movie "
  );

  return {
    movies: rows as Movie[],
    total: countResult[0].total
  };
};

// //get movie by search bar:
// export const getMoviesBySearch = async(search: string = "", limit: number = 8, offset: number = 0)=>{

// }