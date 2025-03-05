import { Router } from "express";
import Auth from "./Middleware/auth.js";
import * as user from "./RequestHandler/user.rh.js";




const router=Router()

router.route("/register").post(user.register)
router.route("/login").post(user.login)
router.route("/home").get(Auth,user.Home);
router.route("/profile/:id").get(user.profileUser);
router.route("/update/:id").put(user.updateUser);

export default router