import * as routers from "./modules/index.routes.js";
import dbConnection from "../database/connection.js";
import { globalErrorHandler, invalidUrlHandler } from "./utils/error.js";

const initApp = (app, express) => {
  
  app.use(express.json());
  
  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);
  app.use("/products", routers.productRouter);
  app.use("/coupons", routers.couponRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/orders", routers.orderRouter);
  app.use("/reviews", routers.reviewRouter);
  
  dbConnection();

  app.use("*", invalidUrlHandler);
  app.use(globalErrorHandler);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
  });
};

export default initApp;
