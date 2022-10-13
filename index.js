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

  socket.on("list_load", async (data) => {
    const latestStatus = await getLatest();
    socket.to(data.company).emit("initial_load", latestStatus);
  });

  socket.on("join_company", async (data) => {
    socket.join(data);
    console.log("joined company: " + data);
    const latest = await getLatest();
    socket.to("demoCompany").emit("initial_update", latest);
  });

  socket.on("client_update", async (data) => {
    const updatedStatus = await updateStatus({
      name: data.author,
      status: data.status,
      uuid: data.uuid,
    });
    socket.to(data.company).emit("server_update", updatedStatus);
    console.log("sent: " + updatedStatus + data.company);
  });

  app.get("/up-time-check", (req, res, next) => {
    res.send("working");
  });

  app.get("/latest", async (req, res, next) => {
    const latest = await getLatest();
    socket.to("demoCompany").emit("server_update", latest);
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
