import multer from "multer";
import { nanoid } from "nanoid";

export const UPLOAD_DIR = "tmp";

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, callback) => {
    const date = Date.now();
    const id = nanoid();
    const filename = [date, id, file.originalname].join("_");
    callback(null, filename);
  },
  limits: { fileSize: 1_000_000 },
});

export const upload = multer({ storage: storage });
