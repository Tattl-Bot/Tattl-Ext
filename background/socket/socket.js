import serverUrl from "../serverUrl.js";
import getStoredValue from "../../util/getStoredValue.js";
import initEventHandlers from "./eventHandlers/index.js";

const config = {
  autoConnect: false,
};

const socket = io(serverUrl, config);

initEventHandlers(socket);

socket.onAny((event, ...args) => {
  console.log(event, args);
});

async function connectSocket() {
  const token = await getStoredValue("token");
  socket.auth = { token };

  socket.connect();
}

export default socket;
