class GetFeatures {
  constructor(mongooseQuery, queryObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryObj = queryObj;
  }

  paginate() {
    const page = this.queryObj.page < 1 ? 1 : this.queryObj.page * 1 || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);
    this.page = page;

    return this;
  }

  filter() {
    const queryObj_ = { ...this.queryObj };
    const excludedKeys = ["page", "sort", "search", "fields"];
    excludedKeys.forEach((key) => delete queryObj_[key]);
    const filterObj = JSON.parse(
      JSON.stringify(queryObj_).replace(
        /\b(gte|gt|lte|lt|eq|ne)\b/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(filterObj);

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery.sort("-createdAt");
    }

    return this;
  }

  select() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.replaceAll(",", " ");
      this.mongooseQuery.select(fields);
    }

    return this;
  }

  search() {
    if (this.queryObj.search) {
      this.mongooseQuery.find({
        $or: [
          { name: { $regex: this.queryObj.search, $options: "i" } },
          { description: { $regex: this.queryObj.search, $options: "i" } },
        ],
      });
    }

    return this;
  }
}

export default GetFeatures;