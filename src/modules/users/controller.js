import * as UserService from "./service.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

const userValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/)
    .required(),
});

const sanitizeRegisteredUser = ({ email, subscription }) => ({
  email,
  subscription,
});

const sanitizeLoggedInUser = ({ email, subscription, token }) => ({
  token,
  user: {
    email,
    subscription,
  },
});

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = userValidation.validate({ email, password });
    if (error) return res.status(400).json(error);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await UserService.signUp(email, hashedPassword);
    return res.status(201).json(sanitizeRegisteredUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { error } = userValidation.validate({ email, password });
  const user = await UserService.login(email);
  if (error) return res.status(400).json({ message: error.message });
  if (user) {
    const check = await bcrypt.compareSync(password, user.password);
    if (check === true) {
      const token = jwt.sign({ _id: user._id }, config.JWT_SECRET);
      user.token = token;
      await user.save();
      return res.status(200).json(sanitizeLoggedInUser(user));
    }
    return res.status(401).json({ message: "Wrong email or password" });
  }
  return res.status(401).json({ message: "Wrong email or password" });
};

export const current = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authorized" });
  return res.status(200).json(sanitizeLoggedInUser(user));
};

export const logout = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authorized" });
  const id = user._id;
  await UserService.logout(id);

  return res.json({ message: "User successfully logged out" }).status(204);
};
