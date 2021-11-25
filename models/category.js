const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String },
  image: {
    data: Buffer,
    contentType: String,
  },
});

exports.Category = mongoose.model("Category", categorySchema);
