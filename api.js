import express from "express";
import * as ContactController from "./modules/contacts/controller.js";

const api = express.Router();

api.get("/", ContactController.getAllContacts);
api.get("/:id", ContactController.getContactById);
api.post("/", ContactController.createNewContact);
api.patch("/:id", ContactController.updateContactById);
api.delete("/:id", ContactController.removeContactById);
api.patch("/:id/favorite", ContactController.updateFavStatusById)
export default api;
