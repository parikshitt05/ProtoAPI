const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/schemas");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ email, passwordHash: password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, plan: user.plan },
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, email: user.email, plan: user.plan },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me  — verify token and return user
router.get("/me", require("../middleware/auth"), (req, res) => {
  res.json({
    user: { id: req.user._id, email: req.user.email, plan: req.user.plan },
  });
});

module.exports = router;
