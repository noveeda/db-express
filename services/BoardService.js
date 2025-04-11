// BoardService.js
const BoardModel = require("../models/BoardModel");

async function getPostsByUserId(userId) {
  return await BoardModel.getPostsByUserId(userId);
}

async function deleteCommentsByUserId(userId) {
  return await BoardModel.deleteCommentsByUserId(userId);
}

async function deletePostsByUserId(userId) {
  return await BoardModel.deletePostsByUserId(userId);
}

module.exports = {
  getPostsByUserId,
  deleteCommentsByUserId,
  deletePostsByUserId,
};
