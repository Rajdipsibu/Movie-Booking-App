import express from "express";
import usersRoutes from "./routes/usersRoutes.js";
import moviesRoutes from "./routes/moviesRoutes.js";
import theatersRoutes from "./routes/theatersRoutes.js";
import bookingsRoutes from "./routes/bookingsRoutes.js";
import cors from "cors";
const app = express();


// app.use(cors({
//   origin: "http://localhost:5173", // frontend URL
//   credentials: true
// }));

app.use(cors());
//==========middleware==========
app.use(express.json());

//==========routes==============
app.use('/api/users',usersRoutes);
app.use('/api/movies',moviesRoutes);
app.use('/api',theatersRoutes);
app.use('/api/bookings',bookingsRoutes);


// const PORT = 5000;
// app.listen(PORT,()=>{
//   console.log(`server is running on http://localhost:${PORT}`);
// })

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});