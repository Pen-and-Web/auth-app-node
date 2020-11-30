const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const Users = require("./models/users");
const bodyParser = require("body-parser");
const passwordHash = require("password-hash");

app.use(
  bodyParser.json({
    type: "application/json"
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//allow cross platform requests
app.use(cors());

mongoose.connect(
  "mongodb+srv://auth_user:Universal123@cluster0.6frq9.mongodb.net/nodeauth?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
);
mongoose.connection.once("open", () => {
  console.log("connected to database");
});

const port = 8000;

app.get("/", (req, res) => {
  res.statusCode = 200;
  res.send("Hello Client");
});

/// for Registration ////
app.post("/register", (req, res) => {
  var hashedPassword = passwordHash.generate(req.body.password);
  var hashedAnswer = passwordHash.generate(req.body.secret_answer);
  var user = new Users({
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email,
    role: req.body.username,
    secret_answer: hashedAnswer
  });
  user
    .save()
    .then(response => {
      res.statusCode = 200;
      res.send({
        message: "User registerd Successfully",
        username: req.body.username,
        email: req.body.email
      });
    })
    .catch(err => {
      let msg = err;
      if (err.code && err.code === 11000) {
        msg = "User, with provided email, already exist!";
      }
      res.statusCode = 400;
      res.send({ message: msg });
    });
});

/// for Login ////
app.post("/login", async (req, res) => {
  var user = await Users.findOne({
    email: req.body.email
  });
  if (user) {
    if (passwordHash.verify(req.body.password, user.password)) {
      res.statusCode = 200;
      res.send({
        message: "login successfull!",
        id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.statusCode = 200;
      res.send({
        message: "Login failed !! wrong password"
      });
    }
  } else {
    res.statusCode = 200;
    res.send({
      message: "Login failed !! email does not exist"
    });
  }
});

/// for reset password ///
app.post("/resetPassword", async (req, res) => {
  var user = await Users.findOne({
    email: req.body.email
  });
  var hashedPassword = passwordHash.generate(req.body.password);
  if (user) {
    user.password = hashedPassword;
    user
      .save()
      .then(response => {
        res.statusCode = 200;
        res.send({ message: "Password updated Successfully" });
      })
      .catch(err => {
        let msg = err;
        res.statusCode = 400;
        res.send({ message: msg });
      });
  } else {
    res.statusCode = 200;
    res.send({
      message: "Reset failed !! email does not exist"
    });
  }
});

/// for forget password ///
app.post("/forgetPassword", async (req, res) => {
  var user = await Users.findOne({
    email: req.body.email
  });
  if (user) {
    if (passwordHash.verify(req.body.secret_answer, user.secret_answer)) {
      res.statusCode = 200;
      res.send({
        message: "Request successfull!",
        verified: true,
        username: user.username,
        email: user.email
      });
    } else {
      res.statusCode = 200;
      res.send({
        message: "Request failed !! wrong answer"
      });
    }
  } else {
    res.statusCode = 200;
    res.send({
      message: "Request failed !! email does not exist"
    });
  }
});

app.listen(port, () => {
  console.log("Example app listening on port 8000!");
});
