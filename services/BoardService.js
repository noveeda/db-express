// BoardService.js
const BoardModel = require("../models/BoardModel");

async function getPostsByUserId(params) {
  return await BoardModel.getPostsByUserId(params);
}

async function getPostsCountByUserId(userId) {
  return await BoardModel.getPostsCountByUserId(userId);
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
  getPostsCountByUserId,
};
