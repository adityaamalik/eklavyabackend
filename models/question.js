const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  askedby: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],

  date: {
    type: Date,
  },
  reseloved: {
    type: Boolean,
  },
});

exports.Question = mongoose.model("Question", questionSchema);
