const express = require("express");
const router = express.Router();
const BoardController = require("../controllers/BoardController");

router.get("/posts", BoardController.getPosts);
router.get("/post/:id", BoardController.getPostByID);

module.exports = router;
