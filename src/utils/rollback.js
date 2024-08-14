import cloudinary from "./cloudinary.js";

const cloudinaryRollback = async (req, res, next) => {
  if (req.filePath) {
    await cloudinary.api.delete_resources_by_prefix(req.filePath);
    await cloudinary.api.delete_folder(req.filePath);
    next();
  }
};

const databaseRollback = async (req, res, next) => {
  if (req.document) {
    const { model, id } = req.document;
    await model.deleteOne({ _id: id });
  }
};
export { cloudinaryRollback, databaseRollback };
