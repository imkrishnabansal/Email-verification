import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./router";
import { backupPort, corsConfig } from "./app.config";
import { verifyMailer } from "./services/email.service";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "", 10) || backupPort;

import { attachRequestId } from "./middleware/requestid.middleware";
import { errorHandler } from "./middleware/error.middleware";

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachRequestId);

app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  // Verify mailer connectivity on startup (will log success or error)
  verifyMailer().catch(err => {
    console.error('Warning: mailer verify failed at startup. Emails may not be delivered.', err);
  });
})
