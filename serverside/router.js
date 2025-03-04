import { Router } from "express";
import auth from "./Middleware/auth.js";
import * as user from "./RequestHandler/user.rh.js";




const router=Router()

router.route("/register").post(user.register)
router.route("/login").post(user.login)


export default router