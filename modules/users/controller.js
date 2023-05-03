import * as UserService from "./service.js";
import Joi from "joi";

const userValidation = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/),
});

export const singUp = async (req, res) => {
    
}