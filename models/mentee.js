const mongoose = require("mongoose");

const menteeSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,

    required: true,
  },
  profileurl: {
    type: String,
  },
  qualifications: {
    type: String,
    default: "",
  },
  mentors: [
    {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
      },
    },
  ],
  badges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
  ],
  profileHeading: {
    type: String,
  },
  profileDescription: {
    type: String,
  },
  achievements: [
    {
      type: String,
    },
  ],
  skills: {
    type: String,
  },

  review: [
    {
      message: {
        type: String,
      },
      mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
      },
    },
  ],

  meetings: [
    {
      mentee: {
        type: mongoose.Schema.Types.ObjectId,
      },
      url: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
  ],

  resume: {
    type: Object,
  },
  totalCoins: {
    current: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 10,
    },
  },
});

exports.Mentee = mongoose.model("Mentee", menteeSchema);
