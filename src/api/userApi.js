import express from "express";
import * as UserController from "../modules/users/controller.js";
import { auth } from "../middlewares.js";

const api = express.Router();

api.post("/signup", UserController.signUp);
api.post("/login", UserController.login);
api.get("/logout", auth, UserController.logout);
api.get("/current", auth, UserController.current);
api.patch("/", auth, UserController.sub);
export default api;
