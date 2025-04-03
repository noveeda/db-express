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

// app.use("/board", boardRouter);
app.use("/user", userRouter);

// 포트 3000에서 실행
app.listen(port, function () {
  console.log(`Server running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.json({ mesage: "HI" });
});

// app.get("/", (req, res) => {
//   // 세션이 없으면 로그인 페이지로 리다이렉트
//   if (!req.session.user) {
//     return res.redirect("/signin");
//   }

//   const title = "<제13회 무주산골영화제>";

//   const content =
//     '자원활동가 산골친구 모집,"제13회 무주산골영화제 자원활동가 ‘산골친구’를 모집합니다.많은 관심과 지원 부탁드립니다:)\u003Cbr\u003E\u003Cbr\u003E1. 선발일정- 모집기간: 2025.03.31(월) ~ 04.20(일) 23:59- 서류발표: 2025.04.23(수)- 면접기간: 2025.04.28(월) ~ 04.30(수) *온라인- 최종발표: 2025.05.02(금)* 모든 전형 합격/불합격자 발표 개별 이메일 안내<br><br>2. 활동기간 및 교육일정(1) 활동기간: 2025.06.04(수) ~ 06.08.(일) *전북특별자치도 무주군(2) 공식 교육일정- 1차 온라인 교육(전체): 2025.05.14(수) 17:00~18:00- 2차 온라인 교육(팀별): 2025.05.21(수) 16:00~18:00- 현장 교육: 2025.06.04(수) ~06.05(목) *전북특별자치도 무주군* 교육 장소는 추후 안내되며 일정은 변경될 수 있습니다.* 교육을 포함한 공식 일정에 모두 참석해야 하며, 특별한 사유 없이 불참 시 중도 탈락될 수 있습니다.<br><br>3. 모집대상- 만 19세 이상의 대한민국 국민 및 한국어로 의사소통이 가능한 해외동포 또는 국내 거주 외국인- 무주산골영화제에 대한 관심과 자원활동의 목적을 이해하는 자- 무주에서 전일 활동이 가능한 자<br><br>4. 지원방법- [영화제 홈페이지(https://www.mjff.or.kr) - 커뮤니티 - 공지사항] 내 온라인 지원서 작성 후 제출<br><br>5. 활동지원- 활동기간 중 숙식 제공- 영화제 공식 유니폼 및 기념품 제공- 활동 종료 후 교통비 및 소정의 활동비 지급- 활동 완료 시 수료증 및 자원봉사 시간 부여 *자원봉사포털 1365 가입 필수<br><br>6. 모집파트- 마케팅 지원/안내데스크 운영/굿즈샵 운영/물품보관소 운영/티켓부스 운영/상영관 운영/관객이벤트 진행/사진 및 영상 콘텐츠 촬영 (총 8개 파트)<br><br>7. 문의무주산골영화제 산골친구 담당자- Tel: 063)245-6401- E-mail: service2@mjff.or.kr"';

//   res.render("index", { title: title, message: content });
// });

// // GET START
// app.get("/signin", async (req, res) => {
//   res.render("signin", { error: req.session.error });
// });

// app.get("/signup", async (req, res) => {
//   res.render("signup");
// });

// // 사용자 목록 조회
// app.get("/users", async (req, res) => {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const rows = await conn.query("SELECT * FROM users");
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// app.get("/dummy", async (req, res) => {
//   let conn;
//   try {
//     // 페이지네이션 옵션
//     // 페이지 번호 옵션
//     const page = parseInt(req.query.startPage) || 1;
//     // 페이지 당 데이터 개수 옵션
//     const limit = parseInt(req.query.listCel) || 10;
//     // 페이지 번호 증가에 따라 바뀌는 offset 옵션
//     const offset = (page - 1) * limit;

//     // db pool을 통해 커넥션 가져오기
//     conn = await pool.getConnection();

//     const sql = "SELECT * FROM dummy_posts LIMIT ? OFFSET ?";
//     /**
//      * 테이블 dummy_posts 에서
//      * OFFSET 위치에서
//      * LIMIT개 만큼
//      * 모든(*) 컬럼을
//      * 조회(select)하겠다.
//      */
//     const rows = await conn.query(sql, [limit, offset], function (err, rows) {
//       console.log(rows[0]);
//     });
//     res.json({ page, limit, data: rows });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (conn) conn.release();
//   }
// });

// app.get("/process/signup/id", async (req, res) => {
//   const username = req.body;
//   console.log(username);
//   let conn = await pool.getConnection();
//   try {
//     const sql =
//       "SELECT COUNT(USER_USERNAME) FROM USERS WHERE USER_USERNAME = ?;";
//     const rows = await conn.query(sql, [username.username]);

//     // 있는 아이디 인 경우
//     if (rows.length >= 1) {
//       return (req.session.error = "이미 있는 아이디 입니다.");
//     } else {
//       req.session.status;
//     }
//   } catch (err) {}
// });
// // GET END

// // POST START

// app.post("/process/signin", async (req, res) => {
//   // 구조 분해 할당으로 req.body에서 각각의 속성을 받아온다.
//   const { username, password } = req.body;
//   const error = req.session.error; // 세션에서 에러 메시지 가져오기
//   delete req.session.error; // 에러 메시지를 사용한 후 삭제

//   console.log(username, password);

//   // 이미 로그인 돼있으면 시작 페이지로 리다이렉트
//   if (req.session.user) {
//     return res.redirect("/");
//   }

//   // 데이터베이스 연결
//   let conn = await pool.getConnection();
//   try {
//     // username과 password 모두 동일한 결과가 있는지 확인
//     let sql =
//       "SELECT * FROM USERS WHERE USER_USERNAME = ? AND USER_PASSWORD = ?;";
//     const rows = await conn.query(sql, [username, password]);
//     conn.release(); // 커넥션 할당 해제

//     console.log(rows, rows.length);
//     // 없는 경우
//     if (rows.length === 0) {
//       req.session.error = "아이디 또는 비밀번호가 올바르지 않습니다.";
//       console.log(req.session);
//       return res.redirect("/signin"); // 로그인 실패 시 로그인 페이지로 이동
//     }

//     // 있는 경우

//     // 세션 생성(서버에 저장. 클라이언트에겐 자동으로 세션id를 담은 쿠키가 전송됨.)
//     req.session.user = {
//       username: username,
//       nickname: rows[0]["user_nickname"],
//     };
//     res.redirect("/");
//   } catch (err) {
//     res.status(500).json({ message: "서버 오류", error: err });
//   }
// });

// app.post("/process/signup", async (req, res) => {
//   let conn = pool.getConnection();
//   try {
//     const sql = "SELECT COUNT(*) FROM USERS WHERE USER_USERNAME = ?";
//     const username = req.body.name;

//     (await conn).query;
//   } catch (error) {
//     res.error(error);
//   } finally {
//     if (conn) await conn.release();
//   }
// });
