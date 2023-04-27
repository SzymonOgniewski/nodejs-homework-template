import fs from "fs/promises";
import * as ContactService from "./service.js";

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactService.getAll();
    return res.json(contacts);
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getContactById = async (req, res) => {
  try {
    const id = req.params.id;
    const searchedContact = await ContactService.getById(id);
    if (!searchedContact) return res.sendStatus(404);
    return res.json(searchedContact);
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const createNewContact = async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name) return res.sendStatus(400);
  const newContact = await ContactService.createNew(name, phone, email);
  return res.status(201).json(newContact);
};

export const updateContactById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedContactFields = req.body;
    const updatedContact = await ContactService.updateById(
      id,
      updatedContactFields
    );
    return res.json(updatedContact);
  } catch (error) {
    return res.sendStatus(404);
  }
};

export const removeContactById = async (req, res) => {
  try {
    const id = req.params.id;
    const removedContact = await ContactService.removeById(id);
    if (!removedContact) return res.sendStatus(404);
    return res.json(removedContact);
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const updateFavStatusById = async (req, res) => {
  try {
    const id = req.params.id;
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const updatedContact = await ContactService.updateFavById(id, { favorite });
    return res.json(updatedContact);
  } catch (error) {
    return res.sendStatus(404);
  }
};
