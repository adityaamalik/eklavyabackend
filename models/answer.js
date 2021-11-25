const mongoose = require("mongoose");

const answerSchema = mongoose.Schema({
  answer: {
    type: String,
    required: true,
  },
  answeredby: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

exports.Answer = mongoose.model("Answer", answerSchema);
