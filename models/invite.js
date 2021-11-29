const mongoose = require("mongoose");

const inviteSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
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

exports.Invite = mongoose.model("Invite", inviteSchema);
