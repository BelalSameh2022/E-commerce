import dotenv from "dotenv";
dotenv.config();
import express from "express";
import initApp from "./src/initApp.js";

const app = express();
const port = process.env.PORT || 3001;

app.set("case sensitive routing", true);
initApp(app, express);

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
