import slugify from "slugify";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError, asyncErrorHandler } from "../../utils/error.js";
import Brand from "../../../database/models/brand.model.js";

// Add brand
// ============================================
const addBrand = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { name } = req.body;

  const folderId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Brands/${folderId}`,
    }
  );
  req.filePath = `E-commerce/Brands/${folderId}`;

  const brand = await Brand.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    logo: { secure_url, public_id },
    folderId,
    addedBy: userId,
  });
  if (!brand) return next(new AppError("brand addition failed", 400));
  req.document = {
    model: Brand,
    id: brand._id,
  }

  res.status(201).json({ message: "success", brand });
});

// Get brands
// ============================================
const getAllBrands = asyncErrorHandler(async (req, res, next) => {
  const brands = await Brand.find({});
  if (brands.length === 0)
    return next(new AppError("There are no brands added yet", 404));

  res.status(200).json({ message: "success", brands });
});

// Get brand
// ============================================
const getBrand = asyncErrorHandler(async (req, res, next) => {
  const { brandId } = req.params;

  const brand = await Brand.findById(brandId);
  if (!brand) return next(new AppError("Brand not found", 404));

  res.status(200).json({ message: "success", brand });
});

// Update brand
// ============================================
const updateBrand = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { brandId } = req.params;
  const { name } = req.body;

  if (!name && !req.file) return next(new AppError("Nothing to update", 400));

  const brand = await Brand.findOne({ _id: brandId, addedBy: userId });
  if (!brand)
    return next(
      new AppError("Brand not found or you don't have permission", 404)
    );

  if (name) {
    if (brand.name === name.toLowerCase()) {
      return next(new AppError("Already the same name", 400));
    }
    if (await Brand.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("Brand already exists", 409));
    }

    brand.name = name;
    brand.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(brand.logo.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Brands/${brand.folderId}`,
      }
    );

    brand.logo = { secure_url, public_id };
  }

  await brand.save();

  res.status(200).json({ message: "success", brand });
});

// Delete brand
// ============================================
const deleteBrand = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { brandId } = req.params;

  const brand = await Brand.findOneAndDelete({ _id: brandId, addedBy: userId });
  if (!brand)
    return next(
      new AppError("Brand not found or you don't have permission", 404)
    );

  await cloudinary.api.delete_resources_by_prefix(`E-commerce/Brands/${brand.folderId}`);
  await cloudinary.api.delete_folder(`E-commerce/Brands/${brand.folderId}`);

  res.status(200).json({ message: "success", brand });
});

export { addBrand, getAllBrands, getBrand, updateBrand, deleteBrand };
