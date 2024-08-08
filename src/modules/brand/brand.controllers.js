import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Brand from "../../../database/models/brand.model.js";

// Add brand
// ============================================
const addBrand = asyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;

  const folderId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Brands/${folderId}`,
    }
  );

  const brand = await Brand.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    logo: { secure_url, public_id },
    folderId,
    addedBy: req.user.userId,
  });
  if (!brand) return next(new AppError("brand not added", 400));

  res.status(201).json({ message: "success", brand });
});


export { addBrand };
