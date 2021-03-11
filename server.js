const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

const PORT = process.env.PORT || 6500;

// View engine route
app.set("view engine", "ejs");

//Set up the static folder
app.use(express.static("public"));

//Initial route
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

//Chatroom route
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//Socket.io implementation
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
