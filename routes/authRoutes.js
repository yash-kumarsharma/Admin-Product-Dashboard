const express = require("express");
const router = express.Router();
const User = require("../model/user");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists with this email");
    }

    const user = new User({ name, email, password });
    await user.save();

    res.redirect("/login");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.send("Invalid credentials");

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect("/products");
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
