import * as ContactService from "./service.js";
import Joi from "joi";
import { Contact } from "./model.js";

const validationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(30)
    .required()
    .regex(/^[a-zA-Z\s]*$/),
  phone: Joi.string().regex(/^[\d -]{9,12}$/),
  email: Joi.string().email(),
});

export const getAllContacts = async (req, res) => {
  let { page = 1, limit = 10, favorite } = req.query;
  const query = favorite ? { favorite: true } : {};
  try {
    const contacts = await ContactService.getAll(query)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Contact.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      data: contacts,
    });
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
  try {
    const { name, phone, email } = req.body;
    if (!name) return res.sendStatus(400);

    const { error } = validationSchema.validate({ name, phone, email });
    if (error) return res.status(400).json({ error: error.message });
    const newContact = await ContactService.createNew(name, phone, email);
    return res.status(201).json(newContact);
  } catch (error) {
    if (error.code === 11000) {
      return res.sendStatus(400);
    } else {
      return res.sendStatus(500);
    }
  }
};

export const updateContactById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedContactFields = req.body;
    const { name, phone, email } = updatedContactFields;
    const { error } = validationSchema.validate({ name, phone, email });
    if (error) return res.status(400).json({ error: error.message });
    const updatedContact = await ContactService.updateById(
      id,
      updatedContactFields
    );
    return res.json(updatedContact);
  } catch (error) {
    return res.sendStatus(500);
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
