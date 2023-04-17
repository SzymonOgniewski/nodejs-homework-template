import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const contactsPath = path.resolve("models", "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const contact = contacts.find((contact) => contact.id === contactId);
  if (!contact) throw new Error("Not found");

  return contact;
};

const removeContact = async (contactId) => {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const newContacts = contacts.filter((contact) => contact.id !== contactId);
  if (contacts.length === newContacts.length)
    throw new Error(`Could not find any contact with id ${contactId}`);
  await fs.writeFile(contactsPath, JSON.stringify(newContacts), () => {
    console.log(`contact with id ${contactId} has been removed`);
  });
};

const addContact = async (body) => {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const newContact = {
      id: nanoid(),
      ...body,
    };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return newContact;
  } catch (error) {
    throw new Error(`Could not add contact: ${error.message}`);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((contact) => contact.id === contactId);
    if (!contact) {
      throw new Error(`Could not find any contact with id ${contactId}`);
    }
    const updatedContact = {
      ...contact,
      ...body,
      id: contactId,
    };
    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId ? updatedContact : contact
    );
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
    return updatedContact;
  } catch (error) {
    throw new Error("Something went wrong, try again");
  }
};

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
