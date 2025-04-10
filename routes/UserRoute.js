const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// router.get("/", UserController.getUsers);
// router.get("/:username", UserController.getUserByUsername);
router.get("/signin", UserController.viewSignIn);
router.get("/signup", UserController.viewSignUp);
router.get("/mypage", UserController.viewMyPage);
router.get("/logout", UserController.logout);

router.post("/check-username", UserController.isExistUsername);
router.post("/signup", UserController.createUser);
router.post("/signin", UserController.signIn);

router.delete("/:username", UserController.deleteUser);

module.exports = router;
