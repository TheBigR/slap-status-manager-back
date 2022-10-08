import express from "express";
import http from "http";
import cors from "cors";

import { Server } from "socket.io";
import { getLatest, updateStatus } from "./services/fire.service.mjs";

const app = express();
const port = 3001;
app.use(cors());

const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with id: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(data);
    console.log("room is: ", data.room);
    console.log("message is: ", data.message);
    socket.to(data.room).emit("receive_message", data);
  });

  app.get("/up-time-check", (req, res, next) => {
    res.send("working");
  });

  app.get("/latest", async (req, res, next) => {
    const latest = await getLatest();
    res.send(latest);
  });

  app.post("/test", async (req, res) => {
    const resp = await updateStatus(req.body);
    res.send(resp);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
});
