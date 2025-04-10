const UserModel = require("../models/UserModel");

// 회원 전체 가져오기
async function getAllUser(req, res) {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 아이디 중복 확인
async function isExistUsername(req, res) {
  // return res.json({ test: "test" });
  const username = req.body.username;
  try {
    const isExist = await UserModel.isExistUsername(username);

    if (isExist) {
      return res
        .status(200)
        .json({ message: "이미 있는 아이디입니다.", available: false });
    }

    return res
      .status(200)
      .json({ message: "사용 가능한 아이디입니다.", available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 회원 생성
async function createUser(req, res) {
  try {
    const { username, password, nickname } = req.body;
    const newUser = await UserModel.createUser(username, password, nickname);
    res.redirect("/user/signin");
    // res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// 회원 삭제
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
  // 로그인 상태면 board로
  if (req.session.user) {
    return res.redirect("/board/posts");
  }

  // 아니라면 로그인 페이지로
  res.render("signin");
}

function viewSignUp(req, res) {
  res.render("signup");
}

async function signIn(req, res) {
  try {
    const { username, password } = req.body;
    const error = req.session.error; // 세션에서 에러 메시지 가져오기
    delete req.session.error; // 에러 메시지를 사용한 후 삭제

    if (!username || !password) {
      return res
        .status(401)
        .json({ message: "아이디 혹은 비밀번호가 일치하지 않습니다." });
    }

    // 로그인 시도
    const user = await UserModel.validUser(username, password);
    if (!user) {
      req.session.error = "아이디 혹은 비밀번호가 일치하지 않습니다.";

      return res.render("signin", {
        error: "아이디 혹은 비밀번호가 일치하지 않습니다.",
      });
    }

    // console.log(user);

    // 세션 할당
    req.session.user = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };

    console.table(req.session.user);
    res.redirect("/board/posts");
    // res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  //getAllUser,
  viewSignIn,
  viewSignUp,
  signIn,
  isExistUsername,
  createUser,
  deleteUser,
};
