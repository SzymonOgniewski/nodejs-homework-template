import * as UserService from "./service.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import gravatar from "gravatar";
import Jimp from "jimp";
import path from "node:path";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

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

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = userValidation.validate({ email, password });
    if (error) return res.status(400).json(error);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mp" });
    const verificationToken = nanoid();
    const user = await UserService.signUp(
      email,
      hashedPassword,
      avatar,
      verificationToken
    );
    const emailConfig = {
      from: "szymonogniewski00@gmail.com",
      to: `${user.email}`,
      subject: "Verification email",
      text: `To verify your email press this link:http://localhost:3000/api/users/verify/${user.verificationToken}`,
      html: `<strong>To verify your email press this link:</strong><a href="http://localhost:3000/api/users/verify/${user.verificationToken}">http://localhost:3000/api/users/verify/${verificationToken}</a>`,
    };
    sgMail.send(emailConfig).catch((err) => console.log(err));

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
  if (user.verify === false)
    return res.status(400).json({ message: "Email need verification" });
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

export const sub = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authorized" });
  const id = user._id;
  if (
    req.body.subscription === "starter" ||
    req.body.subscription === "pro" ||
    req.body.subscription === "business"
  ) {
    const subscription = (user.subscription = req.body.subscription);
    await UserService.sub(id, subscription);
  } else {
    return res.status(400).json({ message: "Bad request" });
  }

  return res
    .json({ message: `Changed subscription to ${user.subscription}` })
    .status(200);
};

export const avatarUpdate = async (req, res, next) => {
  const id = req.user._id;
  const filename = req.file.filename;
  const tmpPath = path.join(process.cwd(), "tmp", filename);
  const avatarDir = path.join(process.cwd(), "src", "public", "avatars", "/");
  const newAvatarURL = "localhost:3000/avatars/" + filename;
  const currentAvatar = req.user.avatarURL;
  const avatarToRemove = currentAvatar.replace("localhost:3000/avatars/", "");
  try {
    Jimp.read(tmpPath).then((avatar) => {
      return avatar.resize(250, 250).write(`${avatarDir + filename}`);
    });
    await fs.unlink(req.file.path);
    await UserService.avatarUpdate(id, newAvatarURL);
    try {
      await fs.unlink(`${avatarDir + avatarToRemove}`);
    } catch (error) {
      console.error;
    }
  } catch (error) {
    await fs.unlink(req.file.path);
    return res.sendStatus(500);
  }
  res.json({ message: "Avatar updated" });
};

export const verify = async (req, res) => {
  const verificationToken = req.params.verificationToken;
  const user = await UserService.verify(verificationToken);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verify === true)
    return res.status(400).json({ message: "Email is already verified" });
  user.verify = true;
  user.verificationToken = null;
  user.save();
  return res.status(200).json({ message: "Verification successful" });
};

export const resendVerify = async (req, res) => {
  const email = req.body.email;
  if (!email)
    return res.status(400).json({ message: "missing required field: email" });
  const user = await UserService.resendVerify(email);
  if (user.verify === true)
    return res
      .status(404)
      .json({ message: "This email has been already verified" });
  const verificationToken = user.verificationToken;
  const emailConfig = {
    from: "szymonogniewski00@gmail.com",
    to: `${user.email}`,
    subject: "Verification email",
    text: `To verify your email press this link:http://localhost:3000/api/users/verify/${verificationToken}`,
    html: `<strong>To verify your email press this link:</strong><a href="http://localhost:3000/api/users/verify/${verificationToken}">http://localhost:3000/api/users/verify/${verificationToken}</a>`,
  };
  sgMail.send(emailConfig).catch((err) => console.log(err));
  return res.status(200).json({ message: "Verification email sent" });
};
