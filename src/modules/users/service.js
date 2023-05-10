import { User } from "./model.js";

export const signUp = (email, password, avatarURL, verificationToken) =>
  User.create({ email, password, avatarURL, verificationToken });
export const login = (email) => User.findOne({ email });
export const logout = (id) => User.findOneAndUpdate(id, { token: null });
export const current = (id) => User.findOne({ id });
export const sub = (id, subscription) =>
  User.findOneAndUpdate(id, { subscription });
export const avatarUpdate = (id, avatar) =>
  User.findOneAndUpdate(id, { avatarURL: avatar });
export const verify = (verificationToken) =>
  User.findOne({ verificationToken });
export const resendVerify = (email) => User.findOne({ email });
