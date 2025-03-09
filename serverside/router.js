import { Router } from "express";
import Auth from "./Middleware/auth.js";
import * as user from "./RequestHandler/user.rh.js";
import * as message from "./RequestHandler/message.rh.js";

const router = Router();

// User routes
router.route("/register").post(user.register);
router.route("/login").post(user.login);
router.route("/home").get(Auth, user.Home);
router.route("/profile/:id").get(user.profileUser);
router.route("/update/:id").put(user.updateUser);
router.route("/contacts").post( user.getContacts);


// Message routes
router.route("/sendmessage").post( message.sendMessage);
router.route("/messages").post( message.getMessages);

export default router;