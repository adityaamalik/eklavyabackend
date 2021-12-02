const { Mentor } = require("../models/mentor");
const { Mentee } = require("../models/mentee");
const { Category } = require("../models/category");
const { Invite } = require("../models/invite");
const { Answer } = require("../models/answer");
const express = require("express");
const { Meeting } = require("../models/meeting");
const { Question } = require("../models/question");
const router = express.Router();
const mongoose = require("mongoose");
const { Badge } = require("../models/badge");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  const mentorList = await Mentor.find().select("-password");
  if (!mentorList) {
    res.json({ success: false });
  }
  res.send(mentorList);
});

router.get("/badges/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentor: req.params.id };
  }
  const BadgeList = await Badge.find(filter).sort({ date: -1 });
  if (!BadgeList) {
    res.json({ success: false });
  }
  res.send(BadgesList);
});

router.get("/invite/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentor: req.params.id };
  }
  const inviteList = await Invite.find(filter)
    .populate("mentor mentee")
    .sort({ date: -1 });
  if (!inviteList) {
    res.json({ success: false });
  }
  res.send(inviteList);
});

router.get("/QA/:id", async (req, res) => {
  const questionid = mongoose.Types.ObjectId(req.body.question);
  Question.findOne({ _id: questionid })
    .populate("answers") // key to populate
    .then((user) => {
      res.json(user);
    });
});

router.get(`/mentee/:id`, async (req, res) => {
  Mentor.findOne({ _id: req.params.id })
    .populate("mentees") // key to populate
    .then((user) => {
      res.json(user);
    });
});

router.get("/meeting/:id", async (req, res) => {
  let filter = {};
  if (req.params.id) {
    filter = { mentor: req.params.id };
  }
  const meetingList = await Meeting.find(filter).sort({ date: -1 });
  if (!meetingList) {
    res.json({ success: false });
  }
  res.send(meetingList);
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

router.post("/category", uploadOptions.single("image"), async (req, res) => {
  let category = new Category({
    name: req.body.name,
    image: {
      data: fs.readFileSync(
        path.join(__dirname + "//../public/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  });
  category = await category.save();
  if (!category) return res.send("the category cannot be created!");

  res.send(category);
});

router.get("/category", async (req, res) => {
  let categories = await Category.find();

  if (!categories) res.send("error");

  res.send(categories);
});

router.get("/mentors/:id", async (req, res) => {
  console.log(req.params);
  let filter = {};
  if (req.params.id) {
    filter = { category: req.params.id };
  }
  const mentorsList = await Mentor.find(filter);
  if (!mentorsList) {
    res.json({ success: false });
  }
  res.send(mentorsList);
});

router.get("/questionList/:id", async (req, res) => {
  const category = mongoose.Types.ObjectId(req.params.category);
  console.log(req.params);
  let filter = {};
  if (req.params.id) {
    filter = { category: req.params.id };
  }
  const questionList = await Question.find(filter);
  if (!questionList) {
    res.json({ success: false });
  }
  res.send(questionList);
});

router.post("/meeting/:id", async (req, res) => {
  const menteeid = mongoose.Types.ObjectId(req.body.mentee);
  const mentorid = mongoose.Types.ObjectId(req.params.id);

  let meeting = new Meeting({
    message: req.body.message,
    mentee: menteeid,
    mentor: mentorid,
    date: req.body.date,
    url: req.body.url,
  });
  meeting = await meeting.save();
  if (!meeting) return res.send("the Meeting cannot be created!");
  res.send(meeting);
});

router.post("/register", async (req, res) => {
  const secret = process.env.secret;

  const categoryid = mongoose.Types.ObjectId(req.body.category);
  let mentor = new Mentor({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    name: req.body.name,
    profileurl: req.body.profileurl,
    category: categoryid,
  });
  mentor = await mentor.save();
  if (!mentor) return res.send("the mentor cannot be created!");
  const token = jwt.sign(
    {
      email: req.body.email,
    },
    secret,
    { expiresIn: "1d" }
  );
  res.status(200).send({ mentor: mentor, token: token });
});

router.post("/login", async (req, res) => {
  const mentor = await Mentor.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!mentor) {
    return res.status(400).send("The mentor not found");
  }

  if (mentor && bcrypt.compareSync(req.body.password, mentor.password)) {
    const token = jwt.sign(
      {
        mentorid: mentor._id,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({ mentor: mentor, token: token });
  } else {
    res.status(400).send("password incorrect");
  }
});

router.put("/invite/accept/:id", async (req, res) => {
  const inviteid = mongoose.Types.ObjectId(req.body.invite);
  const inviteis = await Invite.findById(inviteid);
  console.log(inviteis);
  const mentorid = mongoose.Types.ObjectId(req.params.id);
  const mentorobj = await Mentor.findById(mentorid);
  const menteeArray = mentorobj.mentees;

  menteeArray.push(mongoose.Types.ObjectId(inviteis.mentee));
  let params = {
    mentees: menteeArray,
  };

  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });

  const menteeid = mongoose.Types.ObjectId(inviteis.mentee);
  const menteeobj = await Mentee.findById(menteeid);
  const mentorArray = menteeobj.mentors;
  const objofmetee = {
    category: mongoose.Types.ObjectId(mentorobj.category),
    mentor: mentorid,
  };

  mentorArray.push(objofmetee);
  params = {
    mentors: mentorArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentee = await Mentee.findByIdAndUpdate(menteeid, params, {
    new: true,
  });

  try {
    const invite = await Invite.findByIdAndDelete(inviteid);
    if (!invite) {
      return res.status(404).send();
    }
    res.send("invite accepted");
  } catch (error) {
    res.status(500).send(error);
  }
});

// for skills
router.put("/skills/:id", async (req, res) => {
  const mentorA = await Mentor.findById(req.params.id);
  const skillsArray = mentorA.skilla;
  skillsArray.push(req.body.skills);
  let params = {
    skills: skillsArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentor) return res.send("the skills cannot be updated!");
  res.send(mentor);
});

// for achievements
router.put("/achievements/:id", async (req, res) => {
  const mentorA = await Mentor.findById(req.params.id);
  const achievementsArray = mentorA.achivemenets;
  achievementsArray.push(req.body.achivemenets);
  let params = {
    achivemenets: achievementsArray,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentor) return res.send("the skills cannot be updated!");
  res.send(mentor);
});

//answer
router.post("/answers/:id", async (req, res) => {
  const mentorid = mongoose.Types.ObjectId(req.params.id);

  let answer = new Answer({
    answer: req.body.answer,
    answeredby: mentorid,
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
    if (!questiona) return res.send("the badges cannot be updated!");

    res.send(answer);
  }
});

router.post("/badges/:id", uploadOptions.single("image"), async (req, res) => {
  const mentorid = mongoose.Types.ObjectId(req.params.id);
  const mentorobj = await Mentor.findById(mentorid);

  let coins = mentorobj.totalCoins;
  console.log(parseInt(req.body.value));
  let coinss = coins;
  if (coins.current - parseInt(req.body.value) > 0) {
    coinss.current = coinss.current - parseInt(req.body.value);

    let params = {
      totalCoins: coinss,
    };

    for (let prop in params) if (!params[prop]) delete params[prop];
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, params, {
      new: true,
    });

    const today = Date.now();
    let badge = new Badge({
      name: req.body.question,
      description: req.body.description,
      value: req.body.value,
      mentor: req.params.id,
      mentee: mongoose.Types.ObjectId(req.body.mentee),
      date: today,
      image: {
        data: fs.readFileSync(
          path.join(__dirname + "//../public/uploads/" + req.file.filename)
        ),
        contentType: "image/png",
      },
    });

    const value = req.body.value;
    const menteeid = mongoose.Types.ObjectId(req.body.mentee);
    const menteeobj = await Mentee.findById(menteeid);
    const coins = menteeobj.totalCoins;
    coins.current = coins.current + parseInt(value);
    coins.total = coins.total + parseInt(value);

    params = {
      totalCoins: coins,
    };

    for (let prop in params) if (!params[prop]) delete params[prop];
    const mentee = await Mentee.findByIdAndUpdate(menteeid, params, {
      new: true,
    });

    badge = await badge.save();
    if (!badge) return res.send("the answer cannot be created!");
    res.send(badge);
  } else res.send("Not enough coins");
});

router.put("/badges/:id", async (req, res) => {
  const badgeid = mongoose.Types.ObjectId(req.body.badge);
  const badgeobj = await Badge.findById(badgeid);
  const value = badgeobj.value;
  const menteeid = mongoose.Types.ObjectId(req.body.mentee);
  const menteeobj = await Mentee.findById(menteeid);
  const coins = menteeobj.totalCoins;
  coins.current = coins.current + value;
  coins.total = coins.total + value;

  let params = {
    totalCoins: coins,
  };

  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentee = await Mentee.findByIdAndUpdate(menteeid, params, {
    new: true,
  });

  params = {
    mentee: menteeid,
  };

  for (let prop in params) if (!params[prop]) delete params[prop];
  const badge = await Badge.findByIdAndUpdate(badgeid, params, {
    new: true,
  });

  if (!badge) return res.send("the answer cannot be created!");
  res.send(mentee);
});

router.post("/question/:id", async (req, res) => {
  const mentorid = mongoose.Types.ObjectId(req.params.id);
  const categoryid = mongoose.Types.ObjectId(req.body.category);
  const today = Date.now();
  let question = new Question({
    question: req.body.question,
    askedby: mentorid,
    category: categoryid,
    date: today,
  });
  question = await question.save();
  if (!question) return res.send("the answer cannot be created!");
  res.send(question);
});

router.put("/:id", async (req, res) => {
  let params = {
    email: req.body.email,
    name: req.body.name,
    qualifications: req.body.a,
    profileHeading: req.body.a,
    profileDescription: req.body.profileDescription,
  };
  for (let prop in params) if (!params[prop]) delete params[prop];
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, params, {
    new: true,
  });
  if (!mentor) return res.send("the mentor cannot be updated!");
  res.send(mentor);
});

router.get("/:id", async (req, res) => {
  Mentor.findOne({ _id: req.params.id })
    .populate("mentees") // key to populate
    .then((user) => {
      res.json(user);
    });
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
