const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const doubtRoutes = require("./routes/doubtRoutes");

// ...



const app = express();
const server = http.createServer(app);

// CORS setup
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
const path = require("path");
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));


// Session middleware
const session = require("express-session");

app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  }
}));

// ✅ Routes
app.use("/api/users", userRoutes);   // includes /leaderboard
app.use("/api/doubts", doubtRoutes); // includes your doubt routes


// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

let onlineTeachers = [];
let onlineStudents = [];

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // Handle student joining
  socket.on("joinStudent", (data) => {
    onlineStudents = onlineStudents.filter(s => s.socketId !== socket.id);

    const studentData = { ...data, socketId: socket.id };
    onlineStudents.push(studentData);
    socket.join("students");

    // Notify teachers about new students online
    io.to("teachers").emit("onlineStudents", onlineStudents);

    // Notify this student about online teachers only
    socket.emit("onlineTeachers", onlineTeachers);
  });

  // Handle teacher joining
  socket.on("joinTeacher", (data) => {
    onlineTeachers = onlineTeachers.filter(t => t.socketId !== socket.id);

    const teacherData = { ...data, socketId: socket.id };
    onlineTeachers.push(teacherData);
    socket.join("teachers");

    // Notify this teacher about students online
    socket.emit("onlineStudents", onlineStudents);

    // Notify all students about online teachers
    io.to("students").emit("onlineTeachers", onlineTeachers);
  });

  // Handle message sending
  socket.on("sendMessage", ({ from, toSocketId, text }) => {
    const payload = {
      fromSocketId: socket.id,
      from,
      text,
      timestamp: new Date(),
    };
    io.to(toSocketId).emit("receiveMessage", payload);
  });

  // Handle disconnects properly
  socket.on("disconnect", () => {
    const teacherIndex = onlineTeachers.findIndex(t => t.socketId === socket.id);
    if (teacherIndex !== -1) {
      onlineTeachers.splice(teacherIndex, 1);
    }
    const studentIndex = onlineStudents.findIndex(s => s.socketId === socket.id);
    if (studentIndex !== -1) {
      onlineStudents.splice(studentIndex, 1);
    }

    io.to("students").emit("onlineTeachers", onlineTeachers);
    io.to("teachers").emit("onlineStudents", onlineStudents);

    console.log("❌ A user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("🌟 EduSoul API + WebSocket Running!");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
