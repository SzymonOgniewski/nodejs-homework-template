import express from "express";
import {
  getContactById,
  listContacts,
  removeContact,
  addContact,
  updateContact,
} from "../../models/contacts.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    res.json(contact);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", async (req, res, next) => {
  const { email, phone, name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "missing required name - field" });
  }
  if (!email) {
    return res.status(400).json({ message: "missing required email - field" });
  }
  if (!phone) {
    return res.status(400).json({ message: "missing required phone - field" });
  }
  try {
    const newContact = await addContact(req.body);
    console.log(req.body);
    res.json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    await removeContact(contactId);
    res
      .status(200)
      .json({ message: `contact with id ${contactId} has been removed` });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const body = req.body;
  if (JSON.stringify(body) === "{}") {
    return res.status(400).json({ message: "missing fields" });
  }
  try {
    const updatedContact = await updateContact(contactId, body);
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

export default router;
