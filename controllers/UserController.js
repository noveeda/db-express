const UserModel = require("../models/UserModel");

async function getAllUser(req, res) {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUserByUsername(req, res) {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { username, password, nickname } = req.body;
    const newUser = await UserModel.createUser(username, password, nickname);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const success = await UserModel.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function viewSignIn(req, res) {
  res.render("signin");
}

function viewSignUp(req, res) {
  res.render("signup");
}

async function validUser(req, res) {
  try {
    const { username, password } = req.body;
    const error = req.session.error; // 세션에서 에러 메시지 가져오기
    delete req.session.error; // 에러 메시지를 사용한 후 삭제

    // 로그인 시도
    const isValid = await UserModel.validUser(username, password);
    if (!isValid)
      return res
        .status(401)
        .json({ message: "아이디 혹은 비밀번호가 일치하지 않습니다." });

    res.status(200).json({ message: "로그인 성공" });
    req.session.id;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = {
  getAllUser,
  getUserByUsername,
  createUser,
  deleteUser,
  viewSignIn,
  viewSignUp,
  validUser,
};
