import dotenv from "dotenv";
import express from "express";
import { dbConnection } from "./database/connection.js";

dotenv.config();
dbConnection();
const app = express();

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}...`));
