import express from "express";
import * as ContactController from "./modules/contacts/controller.js";
import * as UserController from "./modules/users/controller.js";
const api = express.Router();

api.get("/", ContactController.getAllContacts);
api.get("/:id", ContactController.getContactById);
api.post("/", ContactController.createNewContact);
api.put("/:id", ContactController.updateContactById);
api.delete("/:id", ContactController.removeContactById);
api.patch("/:id/favorite", ContactController.updateFavStatusById);
api.post("/users/signup");

export default api;
