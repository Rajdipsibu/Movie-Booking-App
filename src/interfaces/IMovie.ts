export type MovieStatus = "upcoming" | "running" | "ended";

export interface ICreateMovie {
  name: string;
  description?: string;
  image?: string;
  duration?: number;
  price: number;
  rating?: number;
  release_date?: Date;
  status?: MovieStatus;
}



export interface Movie {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  duration: number | null; // in minutes
  price: number;            // decimal becomes number in TS
  rating: number | null;    // like 8.5
  release_date: Date | null;
  status: MovieStatus;
  created_at: Date;
  updated_at: Date;
}
// movies (
//   id INT UNSIGNED AUTO_INCREMENT,
//   name VARCHAR(150),
//   description TEXT,
//   image VARCHAR(255),
//   duration INT,
//   price DECIMAL(10,2),
//   rating DECIMAL(2,1),
//   release_date DATE,
//   status ENUM('upcoming','running','ended'),
//   is_active BOOLEAN,
//   created_at TIMESTAMP,
//   updated_at TIMESTAMP
// )
