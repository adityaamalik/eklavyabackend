const mongoose = require("mongoose");

const meetingSchema = mongoose.Schema({
  message: {
    type: String,
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
  },
  url: {
    type: String,
  },
  date: {
    type: Date,
  },
});

exports.Meeting = mongoose.model("Meeting", meetingSchema);
