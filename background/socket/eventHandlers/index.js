import connect_error from "./connect_error.js";

function initEventHandlers(socket) {
  socket.on("connect_error", connect_error);
}

export default initEventHandlers;
