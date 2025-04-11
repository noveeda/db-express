// UserService.js
const UserModel = require("../models/UserModel");
const BoardService = require("./BoardService");

async function getUserDashboard(userId) {
  const user = await UserModel.getUser(userId);
  const posts = await BoardService.getPostsByUserId(userId);
  return { user, posts };
}

async function deleteCommentsByUserId(userId) {
  return await BoardService.deleteCommentsByUserId(userId);
}

async function deletePostsByUserId(userId) {
  return await BoardService.deletePostsByUserId(userId);
}

module.exports = {
  getUserDashboard,
  deleteCommentsByUserId,
  deletePostsByUserId,
};
