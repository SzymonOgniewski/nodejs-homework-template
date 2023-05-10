import express from "express";
import * as UserController from "../modules/users/controller.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const api = express.Router();

api.post("/signup", UserController.signUp);
api.post("/login", UserController.login);
api.get("/logout", auth, UserController.logout);
api.get("/current", auth, UserController.current);
api.patch("/", auth, UserController.sub);
api.patch(
  "/avatar",
  auth,
  upload.single("avatar"),
  UserController.avatarUpdate
);
api.get("/verify/:verificationToken", );

export default api;
