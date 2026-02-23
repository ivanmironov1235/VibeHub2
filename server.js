😶‍🌫️, [24.02.2026 1:08]
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

const DATA_FILE = "data.json";

// Проверка и создание пустой базы
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ users: {}, posts: [], chats: {}, notifications: {} })
  );
}

// Чтение/запись данных
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Настройка multer для загрузки аватаров и фото
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Регистрация пользователя
app.post("/register", upload.single("avatar"), (req, res) => {
  const username = req.body.username;
  const avatar = req.file ? "/uploads/" + req.file.filename : "";
  const data = readData();
  if (data.users[username])
    return res.status(400).json({ error: "Пользователь существует" });
  data.users[username] = { avatar, friends: [], requests: [], bg: "", bio: "" };
  writeData(data);
  res.json({ success: true, avatar });
});

// Получение всех пользователей
app.get("/users", (req, res) => {
  const data = readData();
  res.json(data.users);
});

// Отправка запроса в друзья
app.post("/friend-request", (req, res) => {
  const { from, to } = req.body;
  const data = readData();
  if (!data.users[to]) return res.status(404).json({ error: "Not found" });
  if (!data.users[to].requests.includes(from)) data.users[to].requests.push(from);
  writeData(data);
  res.json({ success: true });
});

// Принятие запроса в друзья
app.post("/friend-accept", (req, res) => {
  const { user, friend } = req.body;
  const data = readData();
  if (!data.users[user] || !data.users[friend]) return res.status(400).json({ error: "Bad request" });
  data.users[user].friends.push(friend);
  data.users[friend].friends.push(user);
  data.users[user].requests = data.users[user].requests.filter(f => f !== friend);
  writeData(data);
  res.json({ success: true });
});

// Посты
app.post("/post", upload.single("img"), (req, res) => {
  const { user, content } = req.body;
  const avatar = req.body.avatar || "";
  const img = req.file ? "/uploads/" + req.file.filename : "";
  const data = readData();
  data.posts.unshift({ user, avatar, content, img, likes: [], comments: [] });
  writeData(data);
  res.json({ success: true });
});
app.get("/posts", (req, res) => {
  const data = readData();
  res.json(data.posts);
});

// Чат
app.post("/chat", (req, res) => {
  const { from, to, msg } = req.body;
  const data = readData();
  data.chats[from] = data.chats[from] || {};
  data.chats[from][to] = data.chats[from][to] || [];
  data.chats[from][to].push({ user: from, msg });
  data.chats[to] = data.chats[to] || {};
  data.chats[to][from] = data.chats[to][from] || [];
  data.chats[to][from].push({ user: from, msg });
  writeData(data);
  res.json({ success: true });
});
app.get("/chat/:user1/:user2", (req, res) => {
  const data = readData();
  const { user1, user2 } = req.params;
  res.json((data.chats[user1]  {})[user2]  []);
});

// Уведомления
app.get("/notifications/:user", (req, res) => {
  const data = readData();
  const user = req.params.user;
  res.json(data.notifications[user] || []);
});

// Смена фона профиля
app.post("/update-bg", (req, res) => {
  const { username, bg } = req.body;
  const data = readData();
  if (!data.users[username]) return res.status(404).json({ error: "User not found" });
  data.users[username].bg = bg;
  writeData(data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VibeHub online at ${PORT}`));