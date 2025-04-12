// UserService.js
const UserModel = require("../models/UserModel");
const BoardService = require("./BoardService");

async function getUserDashboard(params) {
  const { userId, startPage, count } = params;
  const user = await UserModel.getUser(userId);
  const posts = await BoardService.getPostsByUserId(params);
  const totalPostsCount = await BoardService.getPostsCountByUserId(userId);
  const totalPages = Math.ceil(totalPostsCount / count);

  const result = {
    user: user,
    startPage: startPage,
    count: count,
    totalPostsCount: totalPostsCount,
    totalPages: totalPages,
    posts: posts,
  };
  return result;
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
