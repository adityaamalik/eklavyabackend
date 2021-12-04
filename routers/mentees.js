const { Mentee } = require("../models/mentee");
const { Invite } = require("../models/invite");
const { Answer } = require("../models/answer");
const express = require("express");
const { Meeting } = require("../models/meeting");
const { Question } = require("../models/question");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Badge } = require("../models/badge");

router.get(`/`, async (req, res) => {
  const menteeList = await Mentee.find().select("-password").sort({ date: -1 });
  if (!menteeList) {
    res.json({ success: false });
  }
  res.send(menteeList);
});

router.get("/query/:id", async (req, res) => {
  const categoryid = mongoose.Types.ObjectId(req.body.category);
  let filter = {};
  if (req.params.id) {
    category = { category: categoryid };
  }
  const questionList = await Question.find(filter).sort({ date: -1 });
  if (!questionList) {
    res.json({ success: false });
  }
  res.send(questionList);
});

router.get("/QA/:id", async (req, res) => {
  const questionid = mongoose.Types.ObjectId(req.body.question);
  Question.findOne({ _id: questionid })
    .populate("answers") // key to populate
    .then((user) => {
      res.json(user);
    });
});

router.get("/badges/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentee: req.params.id };
  }
  Badge.find(filter)
    .populate("mentor mentee")
    .then((user) => {
      res.json(user);
    });
});

router.get("/:id", async (req, res) => {
  Mentee.findOne({ _id: req.params.id })
    .populate({
      path: "mentors",
      populate: [
        {
          path: "mentor",
          model: "Mentor",
        },

        {
          path: "catedgory",
          model: "Category",
        },
      ],
    })
    .then((user) => {
      res.json(user);
    });
});

router.get("/invite/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentee: req.params.id };
  }

  Invite.find(filter)
    .populate("mentor mentee")
    .then((user) => {
      res.json(user);
    });
});

router.get("/meeting/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentee: req.params.id };
  }
  Meeting.find(filter)
    .populate("mentor mentee")
    .then((user) => {
      res.json(user);
    });
});

router.get("/question/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { askedby: req.params.id };
  }
  const questionList = await Question.find(filter).sort({ date: -1 });
  if (!questionList) {
    res.json({ success: false });
  }
  res.send(questionList);
});

router.get("/questionList/:id", async (req, res) => {
  const category = mongoose.Types.ObjectId(req.params.category);
  console.log(req.params);
  let filter = {};
  if (req.params.id) {
    filter = { category: req.params.id };
  }
  Question.find(filter)
    .populate("answers") // key to populate
    .then((user) => {
      res.json(user);
    });
});

router.get("/answer/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { answeredby: req.params.id };
  }
  const answerList = await Question.find(filter).sort({ date: -1 });
  if (!answerList) {
    res.json({ success: false });
  }
  res.send(answerList);
});

router.post("/meeting/:id", async (req, res) => {
  const mentorid = mongoose.Types.ObjectId(req.body.mentor);
  const menteeid = mongoose.Types.ObjectId(req.params.id);

  let meeting = new Meeting({
    message: req.body.message,
    mentor: mentorid,
    mentee: menteeid,
    date: req.body.date,
    url: req.body.url,
  });
  meeting = await meeting.save();
  if (!meeting) return res.send("the meeting cannot be created!");
  res.send(meeting);
});

router.post("/invite/:id", async (req, res) => {
  const mentorid = mongoose.Types.ObjectId(req.body.mentor);
  const menteeid = mongoose.Types.ObjectId(req.params.id);

  const today = Date.now();
  let invite = new Invite({
    message: req.body.message,
    mentor: mentorid,
    mentee: menteeid,
    date: today,
  });
  invite = await invite.save();
  if (!invite) return res.send("the Invite cannot be created!");
  res.send(invite);
});

router.post("/login", async (req, res) => {
  const mentee = await Mentee.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!mentee) {
    return res.send("email incorrect");
  }

  if (mentee && bcrypt.compareSync(req.body.password, mentee.password)) {
    const token = jwt.sign(
      {
        menteeid: mentee._id,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({ mentee: mentee, token: token });
  } else {
    console.log("d");
    res.send("password incorrect");
  }
});

router.post("/register", async (req, res) => {
  const secret = process.env.secret;
  let mentee = new Mentee({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    name: req.body.name,
  });
  mentee = await mentee.save();
  if (!mentee) return res.send("the mentee cannot be created!");
  const token = jwt.sign(
    {
      email: req.body.email,
    },
    secret,
    { expiresIn: "1d" }
  );
  res.status(200).send({ mentee: mentee, token: token });
});

// for skills
router.put("/skills/:id", async (req, res) => {
  const menteeA = await Mentee.findById(req.params.id);
  const skillsArray = menteeA.skilla;
  skillsArray.push(req.body.skills);
  let params = {
    skills: skillsArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentee = await Mentee.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentee) return res.send("the skills cannot be updated!");
  res.send(mentee);
});
// for achievements
router.put("/achievements/:id", async (req, res) => {
  const menteeA = await Mentee.findById(req.params.id);
  const achievementsArray = menteeA.achievements;
  achievementsArray.push(req.body.achievements);
  let params = {
    achievements: achievementsArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentee = await Mentee.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentee) return res.send("the skills cannot be updated!");
  res.send(mentee);
});

router.put("/reviews/:id", async (req, res) => {
  const menteeA = await Mentee.findById(req.params.id);
  const reviewArray = menteeA.review;
  reviewArray.push(req.body.review);
  let params = {
    review: reviewArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentee = await Mentee.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentee) return res.send("the skills cannot be updated!");
  res.send(mentee);
});

//answer
router.post("/answers/:id", async (req, res) => {
  const menteeid = mongoose.Types.ObjectId(req.params.id);

  let answer = new Answer({
    answer: req.body.answer,
    answeredby: menteeid,
    date: req.body.date,
  });
  answer = await answer.save();
  if (!answer) return res.send("the answer cannot be created!");
  else {
    const answerid = answer._id;
    const questionid = mongoose.Types.ObjectId(req.body.question);
    const question = await Question.findById(questionid);
    const answerArray = question.answers;

    answerArray.push(answerid);
    let params = {
      answers: answerArray,
    };
    for (let prop in params) if (!params[prop]) delete params[prop];
    const questiona = await Question.findByIdAndUpdate(questionid, params, {
      new: true,
    });
    if (!questiona) return res.send("cannot be updated!");
    res.send(answer);
  }
});

router.post("/question/:id", async (req, res) => {
  const menteeA = await Mentee.findById(req.params.id);
  const coins = menteeA.totalCoins;
  console.log(coins);
  if (coins.current > 0) {
    coins.current = coins.current - 1;
    console.log(coins);
    let params = {
      totalCoins: coins,
    };
    for (let prop in params) if (!params[prop]) delete params[prop];
    const mentee = await Mentee.findByIdAndUpdate(req.params.id, params, {
      new: true,
    });
    console.log(mentee);
    const menteeid = mongoose.Types.ObjectId(req.params.id);
    const categoryid = mongoose.Types.ObjectId(req.body.category);
    const today = Date.now();
    let question = new Question({
      question: req.body.question,
      askedby: menteeid,
      category: categoryid,

      date: today,
    });
    question = await question.save();
    if (!question) return res.send("the answer cannot be created!");
    res.send(question);
  } else res.send("No coins");
});

router.put("/answer/accept/:id", async (req, res) => {
  const answerid = mongoose.Types.ObjectId(req.body.answer);
  const answer = await Answer.findById(answerid);

  if (!answer.verified) {
    const awardeeid = mongoose.Types.ObjectId(answer.answeredby);
    let awardee = await Mentee.findById(awardeeid);
    if (awardee) {
      let coins = awardee.totalCoins;
      coins.current = coins.current + 2;
      coins.total = coins.total + 2;

      let params = {
        totalCoins: coins,
      };

      for (let prop in params) if (!params[prop]) delete params[prop];
      const mentee = await Mentee.findByIdAndUpdate(awardeeid, params, {
        new: true,
      });

      params = {
        verified: true,
      };
      for (let prop in params) if (!params[prop]) delete params[prop];
      const answera = await Answer.findByIdAndUpdate(answerid, params, {
        new: true,
      });

      res.send("verified");
    } else {
      awardee = await Mentor.findById(awardeeid);
      coins = awardee.totalCoins;
      coins.current = coins.current + 2;
      coins.total = coins.total + 2;

      let params = {
        totalCoins: coins,
      };

      for (let prop in params) if (!params[prop]) delete params[prop];
      const mentor = await Mentor.findByIdAndUpdate(awardeeid, params, {
        new: true,
      });

      params = {
        verified: true,
      };
      for (let prop in params) if (!params[prop]) delete params[prop];
      const answera = await Answer.findByIdAndUpdate(answerid, params, {
        new: true,
      });

      res.send(answera);
    }
  } else res.send("Already verified");
});

router.put("/verify/:id", async (req, res) => {
  let params = {
    reseloved: true,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const question = await Question.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!question) return res.send("something went wrong");
  res.send(question);
});

//for profile
router.put("/:id", async (req, res) => {
  // console.log(req.body);
  let params = {
    email: req.body.email,
    name: req.body.name,
    qualifications: req.body.qualifications,
    profileHeading: req.body.profileHeading,
    profileDescription: req.body.profileDescription,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];

  const mentee = await Mentee.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });

  if (!mentee) return res.send("the mentee cannot be updated!");
  res.send(mentee);
});

router.delete("/meeting/:id", async (req, res) => {
  const meetingid = req.body.meeting;
  const meetingList = await Meeting.findByIdAndDelete(meetingid);
  if (!meetingList) {
    res.json({ success: false });
  }
  res.send("deleted");
});

module.exports = router;
