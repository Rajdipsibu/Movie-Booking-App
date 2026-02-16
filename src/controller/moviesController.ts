import { type Request, type Response } from 'express';
import { createMovies, getAllMovies, getMoviesById, getMoviesWithCount } from '../models/movieModel.js';
import pool from '../config/db.js';



//create
export const movieCreatController = async(req:Request,res:Response) => {
  try{
    const { name, price} = req.body;
    
    if (!name && !price) {
      return res.status(400).json({ message: "Missing field" });
    }

    const result: [number, number] = await createMovies({ name, price });

    if(result[0]===1){
      res.status(201).json({
        message: "Movie created ", 
        id: result[1]
      })
    }

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

//Read by Id
export const movieGetByIdController = async(req:Request,res:Response) => {
  try{
    const id = Number(req.params.id);

    const movie = await getMoviesById(id);

    if(!movie) return res.status(404).json({ message: "invalid MovieId !!" });
    
  res.status(200).json({movie});
  }
  catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

//getAll
// export const getAllMoviesController = async (req: Request, res: Response) => {
//   try {
//     //
//     const page = Number(req.query.page)||1;
//     const limit = Number(req.query.limit)||8;
//     const offset = (page - 1) * limit ;
//     //
//     const movies = await getAllMovies(limit,offset);

//     if (!movies || movies.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No movies found"
//       });
//     }

//     res.status(200).json({
//       // success: true,
//       page,
//       limit,
//       count: movies.length,
//       data: movies
//     });

//   } catch (error) {
//     console.error("Error in getAllMoviesController:", error);
    
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };
export const getAllMoviesController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    console.log("with pagination");
    // Destructure both movies and total from the service
    const { movies, total } = await getMoviesWithCount(limit, offset);

    if (!movies || movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found"
      });
    }

    res.status(200).json({
      success: true,
      page,
      limit,
      totalMovies: total, // The total number of records in DB
      totalPages: Math.ceil(total / limit), // Total pages possible
      count: movies.length, // Number of items in current response
      data: movies
    });

  } catch (error) {
    console.error("Error in getAllMoviesController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
////
export const getAll = async(req: Request, res: Response)=>{
  try{
    console.log("hit==========");
    
    let query = "select * from movie";
    const [rows] = await pool.query(query);
    res.status(200).json({ success: true, data: rows })
  }catch(e){
    res.status(500).json({ message: "DB Error to access movies:" });
  }
}

///get by search query and normal:
export const getAll_movie_queryController=async(req: Request, res: Response)=>{
  const searchQuery = req.query?.q;
  console.log("with searchQuery");
  
  try{
    let sql = "select * from movie";
    let param:any[]=[];

    if(searchQuery){
      sql += " where name like ?";
      param.push(`%${searchQuery}%`)
    }else{
      
    }
    const [rows] = await pool.query(sql,param);
    res.status(200).json({ success: true, data: rows })
  }
  catch(e){
    res.status(500).json({ message: "DB Error to access movies:" });
  }
}

/////////////////////get all details by movie id
export const getAllDetailsByMovieId = async (req: Request, res: Response) => {
  try {
    // 1. Destructure and validate input
    const  movie_id = req.params?.movie_id;
    
    if (!movie_id) {
      return res.status(400).json({
        success: false,
        message: "movie_id field is required"
      });
    }

    const query = `
        SELECT 
            s.id AS show_id,
            s.show_date,
            s.show_time,
            m.name AS movie_name,
            m.image AS movie_image,
            m.duration as movie_time,
            t.name AS theater_name,
            t.total_rows,
            t.total_columns
        FROM shows s
        INNER JOIN movie m ON s.movie_id = m.id
        INNER JOIN theaters t ON s.theater_id = t.id
        WHERE s.movie_id = ? 
          AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC;
    `;

    // Note: mysql2 returns [rows, fields], so we destructure [data]
    const [data]: any = await pool.query(query, [movie_id]);

    // 4. Return success response
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (err: any) {
    console.error("Error fetching movie details:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};


/////////////////////get all details by movie id and theater id
export const getAllDetailsByM_idT_id = async (req: Request, res: Response) => {
  try {
    // 1. Destructure and validate input
    const { movie_id,theater_id }= req.query;
    
    if (!movie_id || !theater_id) {
      return res.status(400).json({
        success: false,
        message: "field is required"
      });
    }

    const query = `
        SELECT 
            s.id AS show_id,
            s.show_date,
            s.show_time,
            m.name AS movie_name,
            m.image AS movie_image,
            m.duration as movie_time,
            t.name AS theater_name,
            t.total_rows,
            t.total_columns
        FROM shows s
        INNER JOIN movie m ON s.movie_id = m.id
        INNER JOIN theaters t ON s.theater_id = t.id
        WHERE s.movie_id = ? AND s.theater_id = ?
          AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC;
    `;

    // Note: mysql2 returns [rows, fields], so we destructure [data]
    const [data]: any = await pool.query(query, [movie_id,theater_id]);

    // 4. Return success response
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (err: any) {
    console.error("Error fetching slot details:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};
