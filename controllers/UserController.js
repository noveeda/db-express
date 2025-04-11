const UserModel = require("../models/UserModel");
const { get } = require("../routes/UserRoute");
const UserService = require("../services/UserService");

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
    const userId = parseInt(req.params.userid);
    // 로그인이 안돼있거나 로그인한 사람과 params로 가져온 userId가 맞지 않는 경우 예외처리
    if (!req.session.user || userId !== req.session.user.id) {
      return res.send(`
        <script>
          alert("어림도 없지 암");\n\tlocation.href="/board/posts";
        </script>`);
    }

    const isExist = await UserModel.checkUserByUserId(userId);
    if (!isExist) {
      return res.send(`
        <script>
          alert("없거나 잘못된 사용자입니다.");
          history.back();
        </script>
        `);
    }

    // 댓삭
    await UserService.deleteCommentsByUserId(userId);
    // 글삭
    await UserService.deletePostsByUserId(userId);
    // 유저삭제
    await UserModel.deleteUser(userId);
    // 세션 삭제
    delete req.session.user;

    // 결과 통보
    return res.send(`
      <script>
        alert("삭제 완료되었습니다.");
        location.href="/board/posts";
      </script>
      `);
  } catch (error) {
    throw error;
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
    res.redirect("/board/posts");
    // res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function viewMyPage(req, res) {
  try {
    if (!req.session.user) {
      return res.redirect("/user/signin");
    }

    const userId = parseInt(req.session.user.id);
    const getUserDashboard = await UserService.getUserDashboard(userId);
    const { user, posts } = getUserDashboard;

    // res.json({ user, posts });
    res.render("mypage", { user, posts });
  } catch (error) {
    throw error;
  }
}

function logout(req, res) {
  try {
    if (!req.session.user) {
      res.render("signin");
    }

    delete req.session.user;
    res.redirect("/board/posts");
  } catch (error) {}
}

module.exports = {
  viewSignIn,
  viewSignUp,
  signIn,
  isExistUsername,
  createUser,
  deleteUser,
  viewMyPage,
  logout,
};
