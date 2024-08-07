import dbConnection from "../database/connection.js";
import * as routers from "./modules/index.routes.js";
import { globalErrorHandler, invalidUrlHandler } from "./utils/error.js";

const bootstrap = (app, express) => {
  dbConnection();

  app.use(express.json());
  app.use(express.static("uploads"));

  app.use("/users", routers.userRouter);

  app.use(invalidUrlHandler);
  app.use(globalErrorHandler);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
  });
};

export default bootstrap;
