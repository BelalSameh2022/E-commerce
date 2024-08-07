import { connect } from "mongoose";

const dbConnection = () => {
  return connect(process.env.DB_CONNECTION_URI)
    .then(() => console.log("Database connected successfully..."))
    .catch((err) => console.log(err.message));
};

export default dbConnection;
