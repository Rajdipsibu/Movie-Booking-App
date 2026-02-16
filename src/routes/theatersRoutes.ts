import { Router } from "express";
import { getShowDateController, getShowsController, getTheatersbyMovieController, getMoviebyTheatersController, getTheatersController, getAllMovie_ShowsController } from "../controller/theaterController.js";
import { getShowDetailsById } from "../controller/showController.js";


const router = Router();


router.get('/theater',getTheatersController);
router.get('/theater/:id',getAllMovie_ShowsController);
router.get('/theater/:id/movies',getMoviebyTheatersController);
router.get('/movies/:id/theaters',getTheatersbyMovieController);
router.get('/shows/:show_id',getShowDetailsById);/////////
router.get('/showsdate',getShowDateController);

export default router;