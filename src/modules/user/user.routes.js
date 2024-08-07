import { Router } from "express";
import * as UC from "./user.controllers.js";
import * as UV from "./user.validations.js";
import { checkIfUser } from "../../middlewares/checkIfExists.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const userRouter = Router();

userRouter.post("/signup", validate(UV.signUpSchema), checkIfUser, UC.signUp);
userRouter.get("/confirm/:token", UC.confirmEmail);
userRouter.get("/resend/:reToken", UC.resendConfirmation);
userRouter.post("/signin", UC.signIn);

export default userRouter;
