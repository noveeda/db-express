const { json } = require("express");
const BoardModel = require("../models/BoardModel");

async function getPosts(req, res) {
  try {
    const startPage = parseInt(req.query.startPage) || 1;
    const count = parseInt(req.query.count) || 10;

    let result = await BoardModel.getPosts(startPage, count);
    result = JSON.parse(result);
    // res.json(result);
    return res.render("board", result);
  } catch (error) {
    throw error;
  }
}

async function getPostByID(res, req) {}

module.exports = {
  getPosts,
  getPostByID,
};
