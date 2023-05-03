import { User } from "./model.js";

export const singUp = (email, password) => User.create({ email, password });
