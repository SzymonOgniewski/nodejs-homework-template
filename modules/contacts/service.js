import { Contact } from "./model.js";

export const getAll = () => Contact.find({});

export const getById = (id) => Contact.findOne({ _id: id });

export const createNew = (name, phone, email) =>
  Contact.create({ name, phone, email });

export const updateById = (id, contact) =>
  Contact.findOneAndUpdate({ _id: id }, contact, { new: true });

export const removeById = (id) => Contact.findOneAndDelete({ _id: id });

export const updateFavById = (id, fav) =>
  Contact.findOneAndUpdate({ _id: id }, fav);
