const BoardModel = require("../models/BoardModel");

async function getPosts(res, req) {
  try {
    const result = await BoardModel.getPosts();
    const posts = { length: result["limit"], data: result["data"] };

    res.render("board", posts);
  } catch (error) {
    throw error;
  }
}

async function getPostByID(res, req) {}

module.exports = {
  getPosts,
  getPostByID,
};
