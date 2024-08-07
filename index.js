import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bootstrap from "./src/bootstrap.js";

const app = express();
bootstrap(app, express);
