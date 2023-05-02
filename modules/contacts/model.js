import { Schema, model } from "mongoose";

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
    unique:true
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

export const Contact = model("contact", contactSchema);
