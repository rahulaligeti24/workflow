const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  team: user.team,
  createdAt: user.createdAt,
});

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, team = "" } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      team,
      password: hashPassword(password),
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create account.",
      error: error.message,
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return res.status(200).json({
      message: "Signed in successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to sign in.",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  signin,
};
