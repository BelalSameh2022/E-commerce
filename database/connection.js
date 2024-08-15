import { connect } from "mongoose";

const dbConnection = () => {
  return connect(process.env.ONLINE_DB_URI)
    .then(() => console.log(`Database connected on ${process.env.ONLINE_DB_URI}`))
    .catch((err) => console.log(err.message));
};

export default dbConnection;
