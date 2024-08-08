import multer from "multer";
import { AppError } from "../utils/error.js";

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/"))
    cb(new AppError("Images only accepted", 403), false);

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
