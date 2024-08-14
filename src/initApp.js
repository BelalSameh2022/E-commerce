import * as routers from "./modules/index.routes.js";
import dbConnection from "../database/connection.js";
import { globalErrorHandler, invalidUrlHandler } from "./utils/error.js";
import { cloudinaryRollback, databaseRollback } from "./utils/rollback.js";

const initApp = (app, express) => {
  app.use(express.json());

  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);
  app.use("/products", routers.productRouter);
  app.use("/coupons", routers.couponRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/wishList", routers.wishListRouter);
  app.use("/orders", routers.orderRouter);
  app.use("/reviews", routers.reviewRouter);

  dbConnection();

  app.use("*", invalidUrlHandler);
  app.use(globalErrorHandler);
  app.use(cloudinaryRollback);
  app.use(databaseRollback);
};

export default initApp;
