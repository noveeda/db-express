const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const expressSession = require("express-session");
const serveStatic = require("serve-static");
dotenv.config();

const app = new express();
const port = 3000;

// 라우터 설정
const boardRouter = require("./routes/BoardRoute");
const userRouter = require("./routes/UserRoute");

// view 파일 경로 지정
app.set("views", path.join(__dirname, "views"));
// view engine pug로 지정
app.set("view engine", "pug");

// 미들웨어 등록
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // JSON 형식의 body를 파싱하는 미들웨어
app.use(serveStatic(path.join(__dirname, "public"))); // 정적파일을 제공해주는 미들웨어
// 세션세팅
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET || "mysecretkey", // 세션을 암호화하기 위한 비밀 키 (반드시 변경해야 함, 환경 변수 사용 추천)
    resave: false, // 세션이 변경이 있을 때만 저장 (true면 세션이 안바뀌어도 모든 요청마다 다시 저장)
    saveUninitialized: false, // 로그인하지 않은 사용자도 세션을 생성할지 여부(false는 로그인 등 특정 조건에서만 세션을 저장)
  })
);

app.use("/board", boardRouter);
app.use("/user", userRouter);

// 포트 3000에서 실행
app.listen(port, function () {
  console.log(`Server running on http://localhost:${port}`);
});

// ❗️맨 마지막에 정의되지 않은 모든 경로 처리
app.use((req, res, next) => {
  res.redirect("/board/posts");
});
