const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("./../middleware/jwt.middleware");
const User = require("../models/User.model");
const SALTROUNDS = 10;

router.get("/", (req, res, next) => {
  res.json({ message: "response from a succesful get request to /admin" });
});

router.post("/signup", async (req, res, next) => {
  const { firstName, lastName, email, password, organization } = req.body;
  if (!firstName || !lastName || !email || !password || !organization) {
    res.status(400).json({ errorMessage: "All fields are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email address." });
    return;
  }
  try {
    const dbUser = await User.findOne({ email });
    if (dbUser) {
      console.log("error: email already exists");
      return res.status(400).json({
        errorMessage: "Email already exists. Please try again or login",
      });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      req.body.passwordHash = passwordHash;
      const dbNewUser = await User.create(req.body);
      const user = { id: dbNewUser._id, email: dbNewUser.email };
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ errorMessage: "Both fields required" });
  }
  try {
    const dbUser = await User.findOne({ email });
    if (!dbUser) {
      return res.status(401).json({
        errorMessage:
          "User not found. Please try again or signup if you have not yet registered",
      });
    }

    const passwordCorrect = bcrypt.compareSync(password, dbUser.passwordHash);

    if (passwordCorrect) {
      const { _id, email } = dbUser;
      const payload = { _id, email };
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      res.status(200).json({ authToken });
    } else {
      return res.status(401).json({
        errorMessage: "Password incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
});

router.get("/authenticate", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

module.exports = router;
