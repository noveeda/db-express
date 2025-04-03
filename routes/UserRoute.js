const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// router.get("/", UserController.getUsers);
// router.get("/:username", UserController.getUserByUsername);
router.get("/signin", UserController.viewSignIn);
router.get("/signup", UserController.viewSignUp);

router.post("/signup", UserController.createUser);
router.post("/signin", UserController.validUser);

router.delete("/:username", UserController.deleteUser);

module.exports = router;
