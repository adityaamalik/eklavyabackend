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
    ref: "Mentor",
  },

  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentee",
  },

  date: {
    type: Date,
  },
});

exports.Badge = mongoose.model("Badge", badgeSchema);
