const socket = io("/");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "6501",
});
const videoContainer = document.getElementById("video-container");
const myVideo = document.createElement("video");

//Mute our video so we only listen to others videos
myVideo.muted = true;

const peers = {};

//Connect our video
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  //this should load your video on the screen
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    //Function that listens to the new user's connection event
    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

//Disconnect user
socket.on("user-disconnect", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", id, ROOM_ID);
});

//Function that enables "myVideo" object to use the stream
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoContainer.append(video);
}

function connectNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}
