const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  image: {
    data: Buffer,
    contentType: String,
  },

  value: { type: Number },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
  },

  mentee: {
    type: mongoose.Schema.Types.ObjectId,
  },

  date: {
    type: Date,
  },
});

exports.Badge = mongoose.model("Badge", badgeSchema);
