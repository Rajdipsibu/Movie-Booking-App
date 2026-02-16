import { Router } from "express";
import { movieCreatController, movieGetByIdController, getAllMoviesController, getAll_movie_queryController, getAllDetailsByMovieId ,getAll, getAllDetailsByM_idT_id} from "../controller/moviesController.js";
import { getShowsByMovieAndTheater } from "../controller/bookingController.js";


const router = Router();

router.get('/search',getAll_movie_queryController);
router.get('/get',getAllMoviesController);
router.get('/getall',getAll);
router.get('/shows/:movie_id',getAllDetailsByMovieId);//get all details abou the movie
router.post('/add',movieCreatController);
router.get('/get/:id',movieGetByIdController);
router.get('/shows/movie/:movieId/theater/:theaterId',getShowsByMovieAndTheater);
router.get('/slots',getAllDetailsByM_idT_id);

export default router;